/**
 * Pagination primitives shared by every listing, public and admin.
 *
 * Offset pagination is used deliberately: NGO archives are small enough that
 * deep-offset cost never bites, and readers expect stable, linkable, crawlable
 * page numbers (`/news?page=3`) — which cursor pagination cannot give search
 * engines. Supabase `.range()` maps onto it directly.
 */

export interface PageResult<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  from: number;
  to: number;
}

export const DEFAULT_PER_PAGE = 9;
const MAX_PER_PAGE = 60;

/** Coerce an untrusted `?page=` value into a usable page number. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parsePerPage(
  value: string | string[] | undefined,
  fallback = DEFAULT_PER_PAGE,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, MAX_PER_PAGE);
}

/** Inclusive `[from, to]` bounds for Supabase `.range()`. */
export function rangeFor(page: number, perPage: number): [number, number] {
  const from = (page - 1) * perPage;
  return [from, from + perPage - 1];
}

export function buildPage<T>(
  items: T[],
  total: number,
  page: number,
  perPage: number,
): PageResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  return {
    items,
    page,
    perPage,
    total,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    from,
    to: Math.min(page * perPage, total),
  };
}

/** Paginate an in-memory array — used by the fixture fallback. */
export function paginateArray<T>(all: T[], page: number, perPage: number): PageResult<T> {
  const [from] = rangeFor(page, perPage);
  return buildPage(all.slice(from, from + perPage), all.length, page, perPage);
}

/**
 * Page numbers to render, with `null` marking an ellipsis. Always shows the
 * first and last page plus a window around the current one, so the control
 * keeps a fixed width no matter how deep the archive gets.
 */
export function pageWindow(current: number, total: number, span = 1): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current]);
  for (let i = 1; i <= span; i++) {
    if (current - i > 1) pages.add(current - i);
    if (current + i < total) pages.add(current + i);
  }
  // Keep the control from collapsing to a stub near the ends.
  if (current <= 3) [2, 3, 4].forEach((p) => p < total && pages.add(p));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => p > 1 && pages.add(p));

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const out: (number | null)[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push(null);
    out.push(p);
    prev = p;
  }
  return out;
}

/** Preserve existing query params (filters, search) while changing `page`. */
export function hrefWithPage(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && k !== "page") sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
