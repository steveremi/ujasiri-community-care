import "server-only";

import { adminClient } from "@/lib/supabase/server";
import { buildPage, rangeFor, type PageResult } from "@/lib/pagination";
import type {
  AuditEntry,
  ContactMessage,
  Donation,
  HrRequest,
  JobApplication,
  JobOpening,
  Post,
  Profile,
  Role,
  VolunteerApplication,
} from "@/lib/types";

/**
 * Admin reads.
 *
 * Unlike the public repository, these do NOT fall back to fixtures. An admin
 * screen showing invented donations would be worse than one showing an error —
 * someone would act on it. Every function returns an empty page when the
 * database is unavailable, and the UI says so.
 *
 * All of these use the service-role client and are only reachable from pages
 * that have already called requirePermission.
 */

const EMPTY = <T>(page: number, perPage: number): PageResult<T> =>
  buildPage<T>([], 0, page, perPage);

// --- Dashboard --------------------------------------------------------------

export interface DashboardStats {
  live: boolean;
  donationsThisMonth: { count: number; totalCents: number };
  pendingDonations: number;
  newVolunteers: number;
  openMessages: number;
  draftPosts: number;
  totalUsers: number;
  subscribers: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = adminClient();
  const empty: DashboardStats = {
    live: false,
    donationsThisMonth: { count: 0, totalCents: 0 },
    pendingDonations: 0,
    newVolunteers: 0,
    openMessages: 0,
    draftPosts: 0,
    totalUsers: 0,
    subscribers: 0,
  };
  if (!db) return empty;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // `head: true` fetches only the count — no rows cross the wire.
  const counted = (q: PromiseLike<{ count: number | null }>) =>
    Promise.resolve(q).then((r) => r.count ?? 0);

  const [monthly, pending, volunteers, messages, drafts, users, subs] = await Promise.all([
    db
      .from("donations")
      .select("amount_cents")
      .eq("status", "completed")
      .gte("created_at", monthStart.toISOString()),
    counted(
      db.from("donations").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ),
    counted(
      db
        .from("volunteer_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),
    ),
    counted(
      db.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
    ),
    counted(db.from("posts").select("*", { count: "exact", head: true }).eq("status", "draft")),
    counted(db.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true)),
    counted(db.from("subscribers").select("*", { count: "exact", head: true }).eq("is_active", true)),
  ]);

  const rows = (monthly.data ?? []) as { amount_cents: number }[];

  return {
    live: true,
    donationsThisMonth: {
      count: rows.length,
      totalCents: rows.reduce((sum, r) => sum + r.amount_cents, 0),
    },
    pendingDonations: pending,
    newVolunteers: volunteers,
    openMessages: messages,
    draftPosts: drafts,
    totalUsers: users,
    subscribers: subs,
  };
}

// --- People -----------------------------------------------------------------

export async function listUsers(opts: {
  page: number;
  perPage: number;
  search?: string;
  roleId?: number;
  activeOnly?: boolean;
}): Promise<PageResult<Profile>> {
  const db = adminClient();
  if (!db) return EMPTY<Profile>(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db
    .from("profiles")
    .select("*, roles!inner(name, label, rank)", { count: "exact" });

  if (opts.search?.trim()) {
    const term = opts.search.trim().replace(/[%,()]/g, "");
    q = q.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
  }
  if (opts.roleId) q = q.eq("role_id", opts.roleId);
  if (opts.activeOnly) q = q.eq("is_active", true);

  const { data, count, error } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY<Profile>(opts.page, opts.perPage);

  const items = (data ?? []).map((row) => {
    const { roles, ...profile } = row as Profile & {
      roles?: { name: string; label: string; rank: number };
    };
    return {
      ...profile,
      role_name: roles?.name,
      role_label: roles?.label,
      role_rank: roles?.rank,
    } as Profile;
  });

  return buildPage(items, count ?? 0, opts.page, opts.perPage);
}

export async function listRoles(): Promise<Role[]> {
  const db = adminClient();
  if (!db) return [];

  const { data, error } = await db
    .from("roles")
    .select("*, role_permissions(permission)")
    .order("rank", { ascending: false });

  if (error || !data) return [];

  // One extra query beats N+1 counts, one per role.
  const { data: counts } = await db.from("profiles").select("role_id");
  const tally = new Map<number, number>();
  for (const row of (counts ?? []) as { role_id: number }[]) {
    tally.set(row.role_id, (tally.get(row.role_id) ?? 0) + 1);
  }

  return data.map((row) => {
    const { role_permissions, ...role } = row as Role & {
      role_permissions?: { permission: string }[];
    };
    return {
      ...role,
      permissions: (role_permissions ?? []).map((p) => p.permission),
      user_count: tally.get(role.id) ?? 0,
    } as Role;
  });
}

// --- Supporters -------------------------------------------------------------

export async function listDonations(opts: {
  page: number;
  perPage: number;
  status?: string;
  search?: string;
}): Promise<PageResult<Donation>> {
  const db = adminClient();
  if (!db) return EMPTY<Donation>(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db.from("donations").select("*", { count: "exact" });

  if (opts.status) q = q.eq("status", opts.status);
  if (opts.search?.trim()) {
    const term = opts.search.trim().replace(/[%,()]/g, "");
    q = q.or(`reference.ilike.%${term}%,donor_name.ilike.%${term}%,donor_email.ilike.%${term}%`);
  }

  const { data, count, error } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY<Donation>(opts.page, opts.perPage);
  return buildPage((data ?? []) as Donation[], count ?? 0, opts.page, opts.perPage);
}

export async function listVolunteerApplications(opts: {
  page: number;
  perPage: number;
  status?: string;
}): Promise<PageResult<VolunteerApplication>> {
  const db = adminClient();
  if (!db) return EMPTY<VolunteerApplication>(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db.from("volunteer_applications").select("*", { count: "exact" });
  if (opts.status) q = q.eq("status", opts.status);

  const { data, count, error } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY<VolunteerApplication>(opts.page, opts.perPage);
  return buildPage((data ?? []) as VolunteerApplication[], count ?? 0, opts.page, opts.perPage);
}

export async function listMessages(opts: {
  page: number;
  perPage: number;
  status?: string;
}): Promise<PageResult<ContactMessage>> {
  const db = adminClient();
  if (!db) return EMPTY<ContactMessage>(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db.from("contact_messages").select("*", { count: "exact" });
  if (opts.status) q = q.eq("status", opts.status);

  const { data, count, error } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY<ContactMessage>(opts.page, opts.perPage);
  return buildPage((data ?? []) as ContactMessage[], count ?? 0, opts.page, opts.perPage);
}

// --- Content ----------------------------------------------------------------

export async function listAllPosts(opts: {
  page: number;
  perPage: number;
  status?: string;
  kind?: string;
  authorId?: string;
  search?: string;
}): Promise<PageResult<Post>> {
  const db = adminClient();
  if (!db) return EMPTY<Post>(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db.from("posts").select("*, profiles(name)", { count: "exact" });

  if (opts.status) q = q.eq("status", opts.status);
  if (opts.kind) q = q.eq("kind", opts.kind);
  // Used to scope an Author to their own drafts.
  if (opts.authorId) q = q.eq("author_id", opts.authorId);
  if (opts.search?.trim()) {
    const term = opts.search.trim().replace(/[%,()]/g, "");
    q = q.ilike("title", `%${term}%`);
  }

  const { data, count, error } = await q
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY<Post>(opts.page, opts.perPage);

  const items = (data ?? []).map((row) => {
    const { profiles, ...post } = row as Post & { profiles?: { name: string } | null };
    return { ...post, author_name: profiles?.name ?? undefined } as Post;
  });

  return buildPage(items, count ?? 0, opts.page, opts.perPage);
}

// --- Audit ------------------------------------------------------------------

export async function listAuditLog(opts: {
  page: number;
  perPage: number;
  action?: string;
}): Promise<PageResult<AuditEntry>> {
  const db = adminClient();
  if (!db) return EMPTY<AuditEntry>(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db.from("audit_log").select("*", { count: "exact" });
  if (opts.action) q = q.eq("action", opts.action);

  const { data, count, error } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY<AuditEntry>(opts.page, opts.perPage);
  return buildPage((data ?? []) as AuditEntry[], count ?? 0, opts.page, opts.perPage);
}

// --- Recruitment & HR -------------------------------------------------------


export async function listAllJobs(opts: {
  page: number;
  perPage: number;
  status?: string;
}): Promise<PageResult<JobOpening & { application_count?: number }>> {
  const db = adminClient();
  if (!db) return EMPTY(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db.from("job_openings").select("*", { count: "exact" });
  if (opts.status) q = q.eq("status", opts.status);

  const { data, count, error } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY(opts.page, opts.perPage);

  // One grouped read rather than a count query per vacancy.
  const { data: apps } = await db.from("job_applications").select("job_id");
  const tally = new Map<number, number>();
  for (const row of (apps ?? []) as { job_id: number }[]) {
    tally.set(row.job_id, (tally.get(row.job_id) ?? 0) + 1);
  }

  const items = ((data ?? []) as JobOpening[]).map((job) => ({
    ...job,
    application_count: tally.get(job.id) ?? 0,
  }));

  return buildPage(items, count ?? 0, opts.page, opts.perPage);
}

export async function listApplications(opts: {
  page: number;
  perPage: number;
  status?: string;
  jobId?: number;
}): Promise<PageResult<JobApplication>> {
  const db = adminClient();
  if (!db) return EMPTY<JobApplication>(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db
    .from("job_applications")
    .select("*, job_openings(title)", { count: "exact" });

  if (opts.status) q = q.eq("status", opts.status);
  if (opts.jobId) q = q.eq("job_id", opts.jobId);

  const { data, count, error } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY<JobApplication>(opts.page, opts.perPage);

  const items = (data ?? []).map((row) => {
    const { job_openings, ...app } = row as JobApplication & {
      job_openings?: { title: string } | null;
    };
    return { ...app, job_title: job_openings?.title } as JobApplication;
  });

  return buildPage(items, count ?? 0, opts.page, opts.perPage);
}

/**
 * HR requests.
 *
 * `includeConfidential` is driven by the caller's permission, never by a query
 * parameter — a grievance must not become readable by adding `?all=1` to a URL.
 */
export async function listHrRequests(opts: {
  page: number;
  perPage: number;
  status?: string;
  includeConfidential: boolean;
}): Promise<PageResult<HrRequest>> {
  const db = adminClient();
  if (!db) return EMPTY<HrRequest>(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db.from("hr_requests").select("*", { count: "exact" });

  if (opts.status) q = q.eq("status", opts.status);
  if (!opts.includeConfidential) q = q.eq("confidential", false);

  const { data, count, error } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY<HrRequest>(opts.page, opts.perPage);
  return buildPage((data ?? []) as HrRequest[], count ?? 0, opts.page, opts.perPage);
}

// --- Newsletter & media -----------------------------------------------------

export interface Subscriber {
  id: number;
  email: string;
  name: string;
  source: string;
  is_active: boolean;
  created_at: string;
}

export interface MediaItem {
  id: number;
  url: string;
  alt: string;
  caption: string;
  credit: string;
  collection: string;
  consent_on_file: boolean;
  created_at: string;
}

export async function listSubscribers(opts: {
  page: number;
  perPage: number;
}): Promise<PageResult<Subscriber>> {
  const db = adminClient();
  if (!db) return EMPTY<Subscriber>(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  const { data, count, error } = await db
    .from("subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY<Subscriber>(opts.page, opts.perPage);
  return buildPage((data ?? []) as Subscriber[], count ?? 0, opts.page, opts.perPage);
}

export async function listMedia(opts: {
  page: number;
  perPage: number;
  collection?: string;
}): Promise<PageResult<MediaItem>> {
  const db = adminClient();
  if (!db) return EMPTY<MediaItem>(opts.page, opts.perPage);

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db.from("media").select("*", { count: "exact" });
  if (opts.collection) q = q.eq("collection", opts.collection);

  const { data, count, error } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return EMPTY<MediaItem>(opts.page, opts.perPage);
  return buildPage((data ?? []) as MediaItem[], count ?? 0, opts.page, opts.perPage);
}
