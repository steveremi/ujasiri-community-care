import type { HealthIndicator } from "@/lib/types";

/**
 * National and county health context.
 *
 * ── These are real, published figures ─────────────────────────────────────
 *
 * Unlike the rest of the demo content, these are not invented. Each is drawn
 * from a published source named on the row and shown beside the figure on the
 * page — Kenya's NSDCC, the Kenya Demographic and Health Survey, the Economic
 * Survey, and the Ministry of Health.
 *
 * That distinction matters. These describe the epidemic UCC works inside, which
 * is public information anybody can check. They are NOT claims about UCC's own
 * performance — those must come from your monitoring and evaluation data,
 * entered through /admin, and they are deliberately absent here.
 *
 * Verify each against its source before launch: national statistics are revised,
 * and a figure that was right in 2025 may not be right now.
 */
export const contextIndicators: HealthIndicator[] = [
  {
    id: 1,
    category: "prevalence",
    label: "Mother-to-child HIV transmission",
    segment: "national",
    value: 9.26,
    unit: "percent",
    period: "2025",
    year: 2025,
    source: "NSDCC, 2025",
    source_url: "https://nsdcc.go.ke",
    better: "lower",
    baseline_value: 8.9,
    baseline_period: "2022",
    county: "Kenya",
    sort_order: 1,
    is_published: true,
  },
  {
    id: 2,
    category: "prevalence",
    label: "Teenage pregnancy",
    segment: "girls aged 15–19",
    value: 19.9,
    unit: "percent",
    period: "2026",
    year: 2026,
    source: "Kenya Economic Survey, 2026",
    source_url: null,
    better: "lower",
    baseline_value: 15,
    baseline_period: "KDHS 2022",
    county: "Kenya",
    sort_order: 2,
    is_published: true,
  },
  {
    id: 3,
    category: "prevalence",
    label: "Teenage pregnancy, highest-burden county",
    segment: "Narok",
    value: 43.3,
    unit: "percent",
    period: "2026",
    year: 2026,
    source: "Kenya Economic Survey, 2026",
    source_url: null,
    better: "lower",
    baseline_value: null,
    baseline_period: "",
    county: "Narok",
    sort_order: 3,
    is_published: true,
  },
  {
    id: 4,
    category: "coverage",
    label: "Antenatal HIV testing coverage",
    segment: "pregnant women, national",
    value: 90.1,
    unit: "percent",
    period: "2025",
    year: 2025,
    source: "NSDCC, 2025",
    source_url: "https://nsdcc.go.ke",
    better: "higher",
    baseline_value: null,
    baseline_period: "",
    county: "Kenya",
    sort_order: 1,
    is_published: true,
  },
  {
    id: 5,
    category: "prevention",
    label: "National eMTCT elimination target",
    segment: "transmission rate to reach by 2030",
    value: 5,
    unit: "percent",
    period: "target",
    year: 2030,
    source: "Dar es Salaam Declaration, 2023",
    source_url: null,
    better: "lower",
    baseline_value: null,
    baseline_period: "",
    county: "Kenya",
    sort_order: 1,
    is_published: true,
  },
  {
    id: 6,
    category: "treatment",
    label: "Infants infected whose mothers stopped or never started treatment",
    segment: "of all infant infections",
    value: 54.7,
    unit: "percent",
    period: "2023",
    year: 2023,
    source: "Kilifi County case-control study, 2023",
    source_url: null,
    better: "lower",
    baseline_value: null,
    baseline_period: "",
    county: "Kilifi",
    sort_order: 1,
    is_published: true,
  },
];
