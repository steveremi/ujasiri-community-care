import "server-only";

import { readClient } from "@/lib/supabase/server";
import { contextIndicators } from "@/lib/fixtures/indicators";
import type { HealthIndicator } from "@/lib/types";

/**
 * Health indicators.
 *
 * The fallback is national context data — real, published figures from NSDCC,
 * the KDHS and the Economic Survey, each carrying its source. That is safe to
 * ship because it describes the epidemic UCC works inside, which is public
 * information anybody can verify.
 *
 * It contains no claim about UCC's own performance. Those figures must come
 * from your own monitoring data, entered through the admin, and until they are
 * the page simply does not assert them.
 *
 * The `source` filter is applied here and enforced again by row-level security,
 * so an unattributed indicator cannot reach the public site even if a page
 * forgets to check.
 */
export async function listIndicators(category?: string): Promise<HealthIndicator[]> {
  const db = readClient();
  if (!db) {
    return category
      ? contextIndicators.filter((i) => i.category === category)
      : contextIndicators;
  }

  let q = db
    .from("health_indicators")
    .select("*")
    .eq("is_published", true)
    .neq("source", "");

  if (category) q = q.eq("category", category);

  const { data, error } = await q.order("sort_order");
  if (error) return [];
  // An empty table means nothing has been entered yet — fall back to the
  // national context so the page is still informative.
  if (!data?.length) {
    return category
      ? contextIndicators.filter((i) => i.category === category)
      : contextIndicators;
  }
  return data as HealthIndicator[];
}

/** Indicators grouped by category, in a fixed display order. */
export async function listIndicatorsByCategory(): Promise<
  { category: string; label: string; items: HealthIndicator[] }[]
> {
  const all = await listIndicators();

  const groups = [
    { category: "prevalence", label: "The epidemic where we work" },
    { category: "prevention", label: "Prevention" },
    { category: "treatment", label: "Treatment and retention" },
    { category: "screening", label: "Screening" },
    { category: "coverage", label: "Coverage" },
  ];

  return groups
    .map((g) => ({ ...g, items: all.filter((i) => i.category === g.category) }))
    .filter((g) => g.items.length > 0);
}
