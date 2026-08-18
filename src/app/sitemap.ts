import type { MetadataRoute } from "next";

import { allPostSlugs, listPrograms, listProjects } from "@/lib/repos/content";
import { allJobSlugs } from "@/lib/repos/jobs";
import { site } from "@/lib/site";

/**
 * XML sitemap.
 *
 * Priorities are set by what we actually want found. `/get-help` and its
 * children rank alongside the homepage because somebody searching "HIV testing
 * near me" or "what to do after rape Kenya" needs to land on them, and that
 * matters more than any fundraising page ranking well.
 */

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = ([
    { url: base, changeFrequency: "weekly", priority: 1 },

    // Support pathways — the highest-value pages on the site.
    { url: `${base}/get-help`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/get-help/gbv`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/get-help/hiv`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/get-help/tb`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/get-help/cancer`, changeFrequency: "monthly", priority: 0.9 },

    { url: `${base}/programs`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/news`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/impact`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/donate`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/careers`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/opportunities`, changeFrequency: "weekly", priority: 0.7 },

    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/team`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/partners`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/transparency`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/reports`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/governance`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/accountability`, changeFrequency: "yearly", priority: 0.6 },

    { url: `${base}/get-involved`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/get-involved/volunteer`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/get-involved/partner`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/get-involved/fundraise`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.6 },

    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/accessibility`, changeFrequency: "yearly", priority: 0.3 },
  ] satisfies MetadataRoute.Sitemap).map((entry) => ({ ...entry, lastModified: now }));

  const [posts, programs, projects, jobs] = await Promise.all([
    allPostSlugs(),
    listPrograms(),
    listProjects({ page: 1, perPage: 200 }),
    allJobSlugs(),
  ]);

  return [
    ...staticRoutes,
    ...posts.map((p) => ({
      url: `${base}/news/${p.slug}`,
      lastModified: p.updated ? new Date(p.updated) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...programs.map((p) => ({
      url: `${base}/programs/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...projects.items.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...jobs.map((slug) => ({
      url: `${base}/careers/${slug}`,
      lastModified: now,
      // Vacancies change fast and expire; tell crawlers to come back often.
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
