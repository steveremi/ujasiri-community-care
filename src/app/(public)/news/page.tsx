import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/site/page-hero";
import { PostCard } from "@/components/site/post-card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { listPosts } from "@/lib/repos/content";
import { DEFAULT_PER_PAGE, parsePage } from "@/lib/pagination";
import type { PostKind } from "@/lib/types";
import { cn } from "@/lib/utils";

export const revalidate = 900;

const filters = [
  { label: "Everything", kind: undefined },
  { label: "News", kind: "news" as const },
  { label: "Stories", kind: "story" as const },
  { label: "Reports", kind: "report" as const },
];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kind?: string }>;
}): Promise<Metadata> {
  const { page, kind } = await searchParams;
  const pageNum = parsePage(page);

  const title =
    kind === "story" ? "Stories" : kind === "report" ? "Reports" : "News & updates";

  return {
    title: pageNum > 1 ? `${title} — page ${pageNum}` : title,
    description:
      "News, field stories and published reports from Ujasiri Community Care — including the results that did not go to plan.",
    alternates: {
      // Page 2+ must not compete with page 1 for the same query; each page
      // canonicalises to itself so the archive is crawled without duplication.
      canonical: pageNum > 1 ? `/news?page=${pageNum}` : "/news",
    },
    // Deep archive pages carry little standalone value in an index.
    robots: pageNum > 3 ? { index: false, follow: true } : undefined,
  };
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kind?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const kind = filters.some((f) => f.kind === params.kind)
    ? (params.kind as PostKind)
    : undefined;

  const result = await listPosts({
    page,
    perPage: DEFAULT_PER_PAGE,
    kind,
    search: params.q,
  });

  const queryParams = { kind: params.kind, q: params.q };

  return (
    <>
      <PageHero
        title="News, stories and reports"
        lead="Written by the people doing the work. We publish what went well and what did not, because an organisation that only reports its successes is telling you half a story."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "News", href: "/news" },
        ]}
      />

      <div className="container-page py-14 lg:py-16">
        {/* Filters are links, not buttons: each filtered view is a real URL a
            visitor can share and a crawler can index. */}
        <nav aria-label="Filter by type" className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const active = filter.kind === kind;
            const href = filter.kind ? `/news?kind=${filter.kind}` : "/news";
            return (
              <Link
                key={filter.label}
                href={href}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                  active
                    ? "bg-navy-900 text-white"
                    : "border-2 border-navy-100 text-navy-700 hover:border-azure-300 hover:bg-azure-50",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        {result.items.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="Nothing here yet"
            description={
              params.q
                ? `No updates match "${params.q}". Try a different search, or browse everything.`
                : "There are no published updates in this category yet. Check back soon."
            }
            action={
              <ButtonLink href="/news" variant="outline">
                Browse everything
              </ButtonLink>
            }
          />
        ) : (
          <>
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <Pagination
              className="mt-14"
              page={result}
              basePath="/news"
              params={queryParams}
              label="updates"
            />
          </>
        )}
      </div>
    </>
  );
}
