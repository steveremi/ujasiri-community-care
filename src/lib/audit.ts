import "server-only";

import { headers } from "next/headers";

import { adminClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/lib/auth/dal";

/**
 * Audit logging.
 *
 * Every privileged write calls this. It is deliberately fire-and-forget with a
 * swallowed error: a failure to write the audit row must never roll back or
 * block the action the user actually asked for. A missing log line is a
 * problem; a donation that silently failed because logging was down is worse.
 *
 * If audit integrity ever needs to be guaranteed rather than best-effort, the
 * right fix is a database trigger, not throwing from here.
 */
export async function recordAudit(entry: {
  actor: SessionUser | null;
  action: string;
  entity?: string;
  entityId?: string | number;
  detail?: Record<string, unknown>;
}): Promise<void> {
  const db = adminClient();
  if (!db) return;

  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;

    await db.from("audit_log").insert({
      actor_id: entry.actor?.id ?? null,
      actor_email: entry.actor?.email ?? "",
      action: entry.action,
      entity: entry.entity ?? "",
      entity_id: entry.entityId != null ? String(entry.entityId) : "",
      detail: entry.detail ?? {},
      ip,
    });
  } catch {
    // Intentionally swallowed — see the note above.
  }
}
