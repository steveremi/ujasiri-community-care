import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth, type DecodedIdToken } from "firebase-admin/auth";

import { env, isFirebaseAdminConfigured } from "@/lib/env";

/**
 * Firebase Admin — the only place a user's identity is *established*.
 *
 * The browser SDK signs the user in and hands us a short-lived ID token. We
 * verify it here and exchange it for a long-lived, httpOnly session cookie.
 * The ID token itself never becomes the session: it is not revocable and it is
 * readable by client JavaScript, so it is unsuitable as one.
 */

const APP_NAME = "ucc-admin";

function app(): App | null {
  if (!isFirebaseAdminConfigured) return null;
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return getApp(APP_NAME);

  return initializeApp(
    {
      credential: cert({
        projectId: env.firebase.adminProjectId!,
        clientEmail: env.firebase.adminClientEmail!,
        privateKey: env.firebase.adminPrivateKey!,
      }),
    },
    APP_NAME,
  );
}

export function adminAuth(): Auth | null {
  const a = app();
  return a ? getAuth(a) : null;
}

/** Session lifetime. Firebase caps session cookies at 14 days. */
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Exchange a freshly-minted ID token for a session cookie.
 *
 * The `auth_time` check refuses tokens older than five minutes so a leaked or
 * replayed ID token cannot be turned into a two-week session.
 */
export async function createSessionCookie(idToken: string): Promise<string | null> {
  const auth = adminAuth();
  if (!auth) return null;

  const decoded = await auth.verifyIdToken(idToken, true);
  if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
    throw new Error("Please sign in again to continue.");
  }

  return auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

/**
 * Verify a session cookie. `checkRevoked` costs a round trip but means
 * disabling an account or revoking its tokens takes effect on the next
 * request rather than in up to two weeks.
 */
export async function verifySessionCookie(
  cookie: string,
): Promise<DecodedIdToken | null> {
  const auth = adminAuth();
  if (!auth) return null;
  try {
    return await auth.verifySessionCookie(cookie, true);
  } catch {
    return null;
  }
}

export async function revokeAllSessions(uid: string): Promise<void> {
  await adminAuth()?.revokeRefreshTokens(uid);
}

/**
 * Mirror the user's role into a Firebase custom claim.
 *
 * Supabase's RLS policies read the role out of the `profiles` table, so this
 * claim is not what authorises anything — it is a convenience so the proxy can
 * make a cheap optimistic redirect without a database round trip. Authority
 * always lives in the database.
 */
export async function setRoleClaim(uid: string, role: string): Promise<void> {
  await adminAuth()?.setCustomUserClaims(uid, { role });
}

export async function createUser(params: {
  email: string;
  password: string;
  displayName: string;
}): Promise<string> {
  const auth = adminAuth();
  if (!auth) throw new Error("Firebase Admin is not configured.");
  const user = await auth.createUser({
    email: params.email,
    password: params.password,
    displayName: params.displayName,
    emailVerified: false,
  });
  return user.uid;
}

export async function deleteUser(uid: string): Promise<void> {
  await adminAuth()?.deleteUser(uid);
}

export async function setUserDisabled(uid: string, disabled: boolean): Promise<void> {
  await adminAuth()?.updateUser(uid, { disabled });
}
