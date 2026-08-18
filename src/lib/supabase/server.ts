import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env, hasServiceRole, isSupabaseConfigured } from "@/lib/env";

/**
 * Server-side Supabase clients.
 *
 * Two of them, and the distinction matters:
 *
 *   readClient()  — anon key. Row-level security applies. Used for everything
 *                   the public site reads, so a policy mistake fails closed.
 *
 *   adminClient() — service role key. Bypasses RLS entirely. Only ever called
 *                   from a Server Action that has already run requirePermission
 *                   for the operation in question.
 */

let cachedRead: SupabaseClient | null = null;
let cachedAdmin: SupabaseClient | null = null;

export function readClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  cachedRead ??= createClient(env.supabase.url!, env.supabase.anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedRead;
}

export function adminClient(): SupabaseClient | null {
  if (!hasServiceRole) return null;
  cachedAdmin ??= createClient(env.supabase.url!, env.supabase.serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAdmin;
}

/**
 * A client that acts *as the signed-in user* by forwarding their Firebase ID
 * token. Supabase verifies it (via Third Party Auth) and the RLS policies see
 * the real UID — so the database enforces permissions a second time, behind
 * the application's own check. Defence in depth.
 */
export function userClient(firebaseIdToken: string): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(env.supabase.url!, env.supabase.anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${firebaseIdToken}` } },
  });
}

/** Thrown when a write is attempted with no service role key configured. */
export class NotConfiguredError extends Error {
  constructor(what = "This action") {
    super(
      `${what} needs a database connection. Add SUPABASE_SERVICE_ROLE_KEY to .env.local — see .env.example.`,
    );
    this.name = "NotConfiguredError";
  }
}

export function requireAdminClient(what?: string): SupabaseClient {
  const client = adminClient();
  if (!client) throw new NotConfiguredError(what);
  return client;
}
