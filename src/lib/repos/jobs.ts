import "server-only";

import { readClient } from "@/lib/supabase/server";
import * as fixtures from "@/lib/fixtures/content";
import type { JobOpening } from "@/lib/types";

/**
 * Vacancy reads.
 *
 * A vacancy is only public when it is open, published, and has not passed its
 * closing date. That last condition is enforced here as well as in the RLS
 * policy — an advert that stays up after it closes collects CVs nobody will
 * ever read, which is a small dishonesty this sector does not need more of.
 */

function isLive(job: JobOpening): boolean {
  if (job.status !== "open") return false;
  if (!job.closes_on) return true;
  return job.closes_on >= new Date().toISOString().slice(0, 10);
}

export async function listOpenJobs(): Promise<JobOpening[]> {
  const db = readClient();
  if (!db) return fixtures.jobOpenings.filter(isLive);

  const { data, error } = await db
    .from("job_openings")
    .select("*")
    .eq("status", "open")
    .lte("published_at", new Date().toISOString())
    .or(`closes_on.is.null,closes_on.gte.${new Date().toISOString().slice(0, 10)}`)
    .order("published_at", { ascending: false });

  if (error || !data) return fixtures.jobOpenings.filter(isLive);
  return data as JobOpening[];
}

export async function getJob(slug: string): Promise<JobOpening | null> {
  const db = readClient();
  if (!db) return fixtures.jobOpenings.find((j) => j.slug === slug) ?? null;

  const { data } = await db.from("job_openings").select("*").eq("slug", slug).maybeSingle();
  return (data as JobOpening) ?? fixtures.jobOpenings.find((j) => j.slug === slug) ?? null;
}

export async function allJobSlugs(): Promise<string[]> {
  const jobs = await listOpenJobs();
  return jobs.map((j) => j.slug);
}

export const EMPLOYMENT_LABELS = {
  full_time: "Full time",
  part_time: "Part time",
  contract: "Contract",
  volunteer: "Volunteer",
  internship: "Internship",
} as const;

/** Days until a vacancy closes. Negative means it already has. */
export function daysUntilClose(job: JobOpening): number | null {
  if (!job.closes_on) return null;
  const diff = new Date(job.closes_on).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}
