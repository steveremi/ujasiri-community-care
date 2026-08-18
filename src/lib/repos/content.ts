import "server-only";

import { readClient } from "@/lib/supabase/server";
import * as fixtures from "@/lib/fixtures/content";
import {
  buildPage,
  paginateArray,
  rangeFor,
  type PageResult,
} from "@/lib/pagination";
import type {
  EventItem,
  FinanceLine,
  ImpactStat,
  Partner,
  Post,
  PostKind,
  Program,
  Project,
  TeamMember,
} from "@/lib/types";

/**
 * Public content reads.
 *
 * Every function has the same shape: try Supabase, and if it is not configured
 * (or the query fails) fall back to the fixtures. That means a missing key or a
 * transient database problem degrades the site to static demo content instead
 * of a 500 — which for a health NGO matters, because the crisis phone numbers
 * on these pages must render even on a bad day.
 */

const publishedPosts = () =>
  fixtures.posts
    .filter((p) => p.status === "published")
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));

// --- Programmes -------------------------------------------------------------

export async function listPrograms(): Promise<Program[]> {
  const db = readClient();
  if (!db) return fixtures.programs.filter((p) => p.status === "published");

  const { data, error } = await db
    .from("programs")
    .select("*")
    .eq("status", "published")
    .order("sort_order");

  if (error || !data) return fixtures.programs.filter((p) => p.status === "published");
  return data as Program[];
}

export async function getProgram(slug: string): Promise<Program | null> {
  const db = readClient();
  if (!db) return fixtures.programs.find((p) => p.slug === slug) ?? null;

  const { data } = await db.from("programs").select("*").eq("slug", slug).maybeSingle();
  return (data as Program) ?? fixtures.programs.find((p) => p.slug === slug) ?? null;
}

// --- Projects ---------------------------------------------------------------

export async function listProjects(opts: {
  page: number;
  perPage: number;
  programId?: number;
  status?: string;
  region?: string;
}): Promise<PageResult<Project>> {
  const db = readClient();

  if (!db) {
    const filtered = fixtures.projects.filter(
      (p) =>
        p.visibility === "published" &&
        (!opts.programId || p.program_id === opts.programId) &&
        (!opts.status || p.status === opts.status) &&
        (!opts.region || p.region === opts.region),
    );
    return paginateArray(filtered, opts.page, opts.perPage);
  }

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db
    .from("projects")
    .select("*", { count: "exact" })
    .eq("visibility", "published");

  if (opts.programId) q = q.eq("program_id", opts.programId);
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.region) q = q.eq("region", opts.region);

  const { data, count, error } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    const filtered = fixtures.projects.filter((p) => p.visibility === "published");
    return paginateArray(filtered, opts.page, opts.perPage);
  }

  return buildPage((data ?? []) as Project[], count ?? 0, opts.page, opts.perPage);
}

export async function getProject(slug: string): Promise<Project | null> {
  const db = readClient();
  if (!db) return fixtures.projects.find((p) => p.slug === slug) ?? null;

  const { data } = await db.from("projects").select("*").eq("slug", slug).maybeSingle();
  return (data as Project) ?? fixtures.projects.find((p) => p.slug === slug) ?? null;
}

// --- Posts ------------------------------------------------------------------

export async function listPosts(opts: {
  page: number;
  perPage: number;
  kind?: PostKind;
  programId?: number;
  search?: string;
  excludeId?: number;
}): Promise<PageResult<Post>> {
  const db = readClient();

  if (!db) {
    const term = opts.search?.toLowerCase().trim();
    const filtered = publishedPosts().filter(
      (p) =>
        (!opts.kind || p.kind === opts.kind) &&
        (!opts.programId || p.program_id === opts.programId) &&
        (!opts.excludeId || p.id !== opts.excludeId) &&
        (!term ||
          p.title.toLowerCase().includes(term) ||
          p.excerpt.toLowerCase().includes(term)),
    );
    return paginateArray(filtered, opts.page, opts.perPage);
  }

  const [from, to] = rangeFor(opts.page, opts.perPage);
  let q = db
    .from("posts")
    .select("*, profiles(name)", { count: "exact" })
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());

  if (opts.kind) q = q.eq("kind", opts.kind);
  if (opts.programId) q = q.eq("program_id", opts.programId);
  if (opts.excludeId) q = q.neq("id", opts.excludeId);
  if (opts.search?.trim()) {
    const term = opts.search.trim().replace(/[%,()]/g, "");
    q = q.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  }

  const { data, count, error } = await q
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) return paginateArray(publishedPosts(), opts.page, opts.perPage);

  const items = (data ?? []).map((row) => {
    const { profiles, ...post } = row as Post & { profiles?: { name: string } | null };
    return { ...post, author_name: profiles?.name ?? undefined } as Post;
  });

  return buildPage(items, count ?? 0, opts.page, opts.perPage);
}

export async function getPost(slug: string): Promise<Post | null> {
  const db = readClient();
  if (!db) return publishedPosts().find((p) => p.slug === slug) ?? null;

  const { data } = await db
    .from("posts")
    .select("*, profiles(name)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return publishedPosts().find((p) => p.slug === slug) ?? null;

  const { profiles, ...post } = data as Post & { profiles?: { name: string } | null };
  return { ...post, author_name: profiles?.name ?? undefined } as Post;
}

export async function listFeaturedPosts(limit = 3): Promise<Post[]> {
  const db = readClient();
  if (!db) {
    const featured = publishedPosts().filter((p) => p.featured);
    return (featured.length ? featured : publishedPosts()).slice(0, limit);
  }

  const { data, error } = await db
    .from("posts")
    .select("*, profiles(name)")
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    return publishedPosts().filter((p) => p.featured).slice(0, limit);
  }

  return data.map((row) => {
    const { profiles, ...post } = row as Post & { profiles?: { name: string } | null };
    return { ...post, author_name: profiles?.name ?? undefined } as Post;
  });
}

/** Slugs for generateStaticParams and the sitemap. */
export async function allPostSlugs(): Promise<{ slug: string; updated: string | null }[]> {
  const db = readClient();
  if (!db) return publishedPosts().map((p) => ({ slug: p.slug, updated: p.published_at }));

  const { data } = await db
    .from("posts")
    .select("slug, published_at")
    .eq("status", "published");

  return (data ?? []).map((r) => ({
    slug: r.slug as string,
    updated: r.published_at as string | null,
  }));
}

// --- Events -----------------------------------------------------------------

export async function listUpcomingEvents(limit = 12): Promise<EventItem[]> {
  const now = new Date().toISOString();
  const db = readClient();

  if (!db) {
    return fixtures.events
      .filter((e) => e.starts_at >= now)
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
      .slice(0, limit);
  }

  const { data, error } = await db
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("starts_at", now)
    .order("starts_at")
    .limit(limit);

  if (error || !data) return fixtures.events.slice(0, limit);
  return data as EventItem[];
}

export async function getEvent(slug: string): Promise<EventItem | null> {
  const db = readClient();
  if (!db) return fixtures.events.find((e) => e.slug === slug) ?? null;

  const { data } = await db.from("events").select("*").eq("slug", slug).maybeSingle();
  return (data as EventItem) ?? fixtures.events.find((e) => e.slug === slug) ?? null;
}

// --- People, partners, reporting -------------------------------------------

export async function listTeam(): Promise<TeamMember[]> {
  const db = readClient();
  if (!db) return fixtures.team.filter((t) => t.is_published);

  const { data, error } = await db
    .from("team_members")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  if (error || !data) return fixtures.team;
  return data as TeamMember[];
}

export async function listPartners(): Promise<Partner[]> {
  const db = readClient();
  if (!db) return fixtures.partners;

  const { data, error } = await db.from("partners").select("*").order("sort_order");
  if (error || !data) return fixtures.partners;
  return data as Partner[];
}

export async function listImpactStats(): Promise<ImpactStat[]> {
  const db = readClient();
  if (!db) return fixtures.impactStats;

  const { data, error } = await db.from("impact_stats").select("*").order("sort_order");
  if (error || !data?.length) return fixtures.impactStats;
  return data as ImpactStat[];
}

export async function listFinanceLines(year?: number): Promise<FinanceLine[]> {
  const db = readClient();
  if (!db) {
    return year ? fixtures.financeLines.filter((f) => f.year === year) : fixtures.financeLines;
  }

  let q = db.from("finance_lines").select("*");
  if (year) q = q.eq("year", year);

  const { data, error } = await q.order("sort_order");
  if (error || !data?.length) return fixtures.financeLines;
  return data as FinanceLine[];
}
