/**
 * Environment configuration.
 *
 * The site is designed to run in three states:
 *
 *   1. No keys at all      — every read falls back to the fixtures in
 *                            src/lib/fixtures. The full site renders and can be
 *                            demoed; writes are refused with a clear message.
 *   2. Supabase only       — real content, real pagination. Auth still stubbed.
 *   3. Supabase + Firebase — production. Login, roles and the admin all live.
 *
 * Nothing throws on a missing key at import time: a half-configured deployment
 * should degrade to a working public site, not a white screen.
 */

function read(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export const env = {
  siteUrl: read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",

  supabase: {
    url: read("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    // Server-only. Bypasses RLS, so it must never be imported into a Client
    // Component — every use sits behind a permission check in a Server Action.
    serviceKey: read("SUPABASE_SERVICE_ROLE_KEY"),
  },

  firebase: {
    apiKey: read("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: read("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: read("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: read("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: read("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: read("NEXT_PUBLIC_FIREBASE_APP_ID"),
    // Service account, server-only.
    adminProjectId: read("FIREBASE_PROJECT_ID"),
    adminClientEmail: read("FIREBASE_CLIENT_EMAIL"),
    // Stored with literal "\n" sequences in .env; restore the real newlines.
    adminPrivateKey: read("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
  },
} as const;

export const isSupabaseConfigured = Boolean(env.supabase.url && env.supabase.anonKey);

export const hasServiceRole = Boolean(isSupabaseConfigured && env.supabase.serviceKey);

export const isFirebaseClientConfigured = Boolean(
  env.firebase.apiKey && env.firebase.authDomain && env.firebase.projectId,
);

export const isFirebaseAdminConfigured = Boolean(
  env.firebase.adminProjectId && env.firebase.adminClientEmail && env.firebase.adminPrivateKey,
);

/** True when login can actually work end to end. */
export const isAuthConfigured = isFirebaseClientConfigured && isFirebaseAdminConfigured;

/** True when the site is running on fixture content rather than real data. */
export const isDemoMode = !isSupabaseConfigured;

/** Human-readable setup state, surfaced in the admin and the dev banner. */
export function setupStatus() {
  return [
    {
      key: "supabase",
      label: "Supabase database",
      ready: isSupabaseConfigured,
      detail: isSupabaseConfigured
        ? hasServiceRole
          ? "Connected with service role"
          : "Connected (read-only — add SUPABASE_SERVICE_ROLE_KEY to enable admin writes)"
        : "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    },
    {
      key: "firebase-client",
      label: "Firebase Auth (browser)",
      ready: isFirebaseClientConfigured,
      detail: isFirebaseClientConfigured
        ? "Sign-in form is live"
        : "Add the NEXT_PUBLIC_FIREBASE_* values from your Firebase web app config",
    },
    {
      key: "firebase-admin",
      label: "Firebase Admin (server)",
      ready: isFirebaseAdminConfigured,
      detail: isFirebaseAdminConfigured
        ? "Sessions are verified server-side"
        : "Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY from a service account JSON",
    },
  ];
}
