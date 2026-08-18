import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { hrefWithPage, pageWindow, type PageResult } from "@/lib/pagination";
import { cn } from "@/lib/utils";

/**
 * Paginated navigation, rendered as real links.
 *
 * Deliberately anchors rather than buttons: each page is a distinct URL that
 * can be linked, shared, bookmarked and — the point for an NGO that needs to
 * be found — crawled by a search engine. `rel="prev"/"next"` tells crawlers
 * these pages form one sequence.
 */
export function Pagination<T>({
  page,
  basePath,
  params = {},
  label = "results",
  className,
}: {
  page: PageResult<T>;
  basePath: string;
  params?: Record<string, string | undefined>;
  label?: string;
  className?: string;
}) {
  if (page.totalPages <= 1) {
    return page.total > 0 ? (
      <p className={cn("text-sm text-navy-500", className)}>
        Showing all {page.total} {label}
      </p>
    ) : null;
  }

  const windowed = pageWindow(page.page, page.totalPages);
  const link = (n: number) => hrefWithPage(basePath, params, n);

  const arrow =
    "grid size-10 place-items-center rounded-full border border-navy-200 text-navy-700 transition-colors hover:border-navy-300 hover:bg-navy-50";
  const disabled = "grid size-10 place-items-center rounded-full border border-navy-100 text-navy-300";

  return (
    <nav
      className={cn("flex flex-col items-center gap-4", className)}
      aria-label="Pagination"
    >
      <div className="flex items-center gap-1.5">
        {page.hasPrev ? (
          <Link href={link(page.page - 1)} rel="prev" className={arrow} aria-label="Previous page">
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className={disabled} aria-hidden="true">
            <ChevronLeft className="size-4" />
          </span>
        )}

        {windowed.map((n, i) =>
          n === null ? (
            <span key={`gap-${i}`} className="px-1 text-navy-300" aria-hidden="true">
              …
            </span>
          ) : n === page.page ? (
            <span
              key={n}
              aria-current="page"
              className="grid size-10 place-items-center rounded-full bg-navy-900 text-sm font-semibold text-white"
            >
              {n}
            </span>
          ) : (
            <Link
              key={n}
              href={link(n)}
              className="grid size-10 place-items-center rounded-full text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50"
              aria-label={`Page ${n}`}
            >
              {n}
            </Link>
          ),
        )}

        {page.hasNext ? (
          <Link href={link(page.page + 1)} rel="next" className={arrow} aria-label="Next page">
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className={disabled} aria-hidden="true">
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>

      <p className="text-sm text-navy-500" role="status">
        Showing <span className="font-medium text-navy-800">{page.from}–{page.to}</span> of{" "}
        <span className="font-medium text-navy-800">{page.total}</span> {label}
      </p>
    </nav>
  );
}
