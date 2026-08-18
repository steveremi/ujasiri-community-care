/** Small shared helpers. Kept dependency-free on purpose. */

/**
 * Merge class names, dropping anything that isn't a non-empty string.
 *
 * Accepts `unknown` so the common `someNode && "class"` guard type-checks
 * regardless of what `someNode` is, and keeps a stray non-string from ending
 * up in the class attribute.
 */
export function cn(...parts: unknown[]): string {
  return parts.filter((p): p is string => typeof p === "string" && p !== "").join(" ");
}

/**
 * Format money held in minor units.
 * `compact` gives "KES 18.6M" for dashboard tiles and charts.
 */
export function formatMoney(
  cents: number,
  currency = "KES",
  opts: { compact?: boolean } = {},
): string {
  const major = cents / 100;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    notation: opts.compact ? "compact" : "standard",
    maximumFractionDigits: opts.compact ? 1 : 0,
  }).format(major);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-KE").format(n);
}

/** "12 March 2025" — unambiguous, and the format Kenyan readers expect. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** "3 days ago" — for admin tables and the audit log. */
export function relativeTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["week", 604_800_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return "just now";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Rough reading time, floor of one minute. */
export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
}

export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Percentage of a funding goal, clamped so a bar never overflows. */
export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.min(100, Math.round((part / whole) * 100));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
