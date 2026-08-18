"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { SESSION_COOKIE, getCurrentUser } from "@/lib/auth/dal";
import {
  SESSION_MAX_AGE_MS,
  createSessionCookie,
  revokeAllSessions,
  setRoleClaim,
} from "@/lib/firebase/admin";
import { adminClient } from "@/lib/supabase/server";
import { isAuthConfigured } from "@/lib/env";
import type { AuthState } from "@/lib/form-state";

/**
 * Session lifecycle.
 *
 * The browser signs in with Firebase and hands us the resulting ID token. From
 * that point everything is server-side: we verify the token, exchange it for an
 * httpOnly session cookie, and make sure a matching profile row exists.
 *
 * The ID token never becomes the session itself — it is readable by client
 * JavaScript and cannot be revoked, so it fails both tests for a session
 * credential.
 */

const sessionSchema = z.object({
  idToken: z.string().min(20, "Sign-in failed. Please try again."),
});

async function requestMeta() {
  const h = await headers();
  return {
    ip:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null,
    userAgent: h.get("user-agent") ?? "",
  };
}

async function audit(entry: {
  actorId: string | null;
  actorEmail: string;
  action: string;
  entity?: string;
  entityId?: string;
  detail?: Record<string, unknown>;
}) {
  const db = adminClient();
  if (!db) return;
  const { ip } = await requestMeta();
  await db.from("audit_log").insert({
    actor_id: entry.actorId,
    actor_email: entry.actorEmail,
    action: entry.action,
    entity: entry.entity ?? "",
    entity_id: entry.entityId ?? "",
    detail: entry.detail ?? {},
    ip,
  });
}

/**
 * Establish a session after a successful Firebase sign-in.
 *
 * Called by both the login and register forms — registration is just sign-in
 * with a profile created first.
 */
export async function createSessionAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isAuthConfigured) {
    return {
      ok: false,
      message:
        "Sign-in is not available yet — Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* and FIREBASE_* values to .env.local.",
    };
  }

  const parsed = sessionSchema.safeParse({ idToken: formData.get("idToken") });
  if (!parsed.success) {
    return { ok: false, message: "Sign-in failed. Please try again." };
  }

  let cookieValue: string | null;
  try {
    cookieValue = await createSessionCookie(parsed.data.idToken);
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Sign-in failed. Please try again.",
    };
  }

  if (!cookieValue) {
    return { ok: false, message: "Sign-in failed. Please try again." };
  }

  (await cookies()).set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });

  const user = await getCurrentUser();
  if (user) {
    const db = adminClient();
    await db
      ?.from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);
    await audit({
      actorId: user.id,
      actorEmail: user.email,
      action: "auth.login",
      entity: "profile",
      entityId: user.id,
    });
  }

  return { ok: true, message: "Signed in.", role: user?.role_name };
}

/**
 * Create the profile row for a newly-registered Firebase user.
 *
 * Delegates to the `claim_superadmin` Postgres function, which decides the role
 * inside a transaction that locks the bootstrap row. That lock is the whole
 * point: two people registering at the same instant cannot both become Super
 * Admin, because the second one blocks until the first has committed the claim.
 */
const registerSchema = z.object({
  uid: z.string().min(6),
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(2, "Tell us your name.").max(120),
});

export async function provisionProfileAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    uid: formData.get("uid"),
    email: formData.get("email"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Registration failed. Please check your details." };
  }

  const db = adminClient();
  if (!db) {
    return {
      ok: false,
      message:
        "Registration is not available yet — the database is not configured. Add your Supabase keys to .env.local.",
    };
  }

  const { data, error } = await db.rpc("claim_superadmin", {
    uid: parsed.data.uid,
    user_email: parsed.data.email,
    user_name: parsed.data.name,
  });

  if (error) {
    return { ok: false, message: "We could not complete your registration. Please try again." };
  }

  const role = (data as string) ?? "MEMBER";

  // Mirror the role into a Firebase claim so the proxy can make a cheap
  // optimistic redirect. Authority still lives in the database.
  await setRoleClaim(parsed.data.uid, role).catch(() => {});

  return {
    ok: true,
    role,
    message:
      role === "SUPER_ADMIN"
        ? "Your account has been created as the organisation's Super Admin."
        : "Your account has been created.",
  };
}

/** Whether the bootstrap super admin has been claimed — drives the register page copy. */
export async function bootstrapClaimed(): Promise<boolean | null> {
  const db = adminClient();
  if (!db) return null;

  const { data } = await db.from("settings").select("value").eq("key", "bootstrap").maybeSingle();
  if (!data) return null;
  return Boolean((data.value as { claimed?: boolean })?.claimed);
}

export async function signOutAction(): Promise<void> {
  const user = await getCurrentUser();
  const store = await cookies();

  if (user) {
    await audit({
      actorId: user.id,
      actorEmail: user.email,
      action: "auth.logout",
      entity: "profile",
      entityId: user.id,
    });
  }

  store.delete(SESSION_COOKIE);
  redirect("/login");
}

/** "Sign out everywhere" — revokes refresh tokens, killing every session. */
export async function signOutEverywhereAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await revokeAllSessions(user.id);
    await audit({
      actorId: user.id,
      actorEmail: user.email,
      action: "auth.revoke_all",
      entity: "profile",
      entityId: user.id,
    });
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
