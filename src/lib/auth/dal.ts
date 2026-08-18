import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { forbidden, redirect, unauthorized } from "next/navigation";

import { verifySessionCookie } from "@/lib/firebase/admin";
import { adminClient } from "@/lib/supabase/server";
import { isAuthConfigured } from "@/lib/env";
import type { Permission } from "@/lib/auth/rbac";
import type { Profile } from "@/lib/types";

/**
 * The Data Access Layer.
 *
 * Every authorisation decision in the application starts here. Pages and
 * Server Actions must not read the session cookie themselves — they call
 * getCurrentUser() or one of the require* guards, so there is exactly one
 * place where "who is this and what may they do" is decided.
 */

export const SESSION_COOKIE = "ucc_session";

export interface SessionUser extends Profile {
  permissions: Permission[];
}

/**
 * Resolve the signed-in user, or null.
 *
 * Wrapped in React's `cache` so a request that checks permissions in a layout,
 * a page and three components still performs one token verification and one
 * database read.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!isAuthConfigured) return null;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const decoded = await verifySessionCookie(token);
  if (!decoded) return null;

  const supabase = adminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*, roles!inner(id, name, label, rank, role_permissions(permission))")
    .eq("id", decoded.uid)
    .maybeSingle();

  if (error || !data) return null;

  // A deactivated account keeps a valid cookie until it expires; treat it as
  // signed out immediately rather than waiting for the cookie to lapse.
  if (!data.is_active) return null;

  const role = data.roles as {
    id: number;
    name: string;
    label: string;
    rank: number;
    role_permissions: { permission: string }[];
  };

  return {
    ...(data as unknown as Profile),
    role_name: role.name,
    role_label: role.label,
    role_rank: role.rank,
    permissions: (role.role_permissions ?? []).map((p) => p.permission as Permission),
  };
});

export async function isSignedIn(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}

export async function can(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.permissions.includes(permission) ?? false;
}

export async function canAny(...permissions: Permission[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

/** Any permission at all means the user has some reason to be in /admin. */
export async function isStaff(): Promise<boolean> {
  const user = await getCurrentUser();
  return (user?.permissions.length ?? 0) > 0;
}

// --- Guards ----------------------------------------------------------------
// These throw. Next.js renders the matching unauthorized.tsx / forbidden.tsx
// boundary, which keeps the distinction a visitor cares about: "you are not
// signed in" is a different message from "you are, but this isn't yours".

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) unauthorized();
  return user;
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) unauthorized();
  if (!user.permissions.includes(permission)) forbidden();
  return user;
}

export async function requireAnyPermission(
  ...permissions: Permission[]
): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) unauthorized();
  if (!permissions.some((p) => user.permissions.includes(p))) forbidden();
  return user;
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) unauthorized();
  if (user.permissions.length === 0) forbidden();
  return user;
}

/** For pages that should bounce an already-signed-in visitor away. */
export async function redirectIfSignedIn(to = "/admin"): Promise<void> {
  if (await getCurrentUser()) redirect(to);
}

/**
 * Guard for role assignment: you may never grant a role at or above your own
 * rank. Without this, any user holding `users:assign_roles` could promote
 * themselves to Super Admin.
 */
export function canAssignRole(actor: SessionUser, targetRoleRank: number): boolean {
  if (!actor.permissions.includes("users:assign_roles")) return false;
  return (actor.role_rank ?? 0) > targetRoleRank;
}
