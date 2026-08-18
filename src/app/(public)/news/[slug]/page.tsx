import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaSlot } from "@/components/media/media-slot";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { PostCard } from "@/components/site/post-card";
import { Badge, Section, SectionHeading } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { allPostSlugs, getPost, listPosts } from "@/lib/repos/content";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const revalidate = 900;

/** Pre-render the archive at build time; anything new is generated on demand. */
export async function generateStaticParams() {
  const slugs = await allPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };

  const title = post.seo_title ?? post.title;
  const description = post.seo_desc ?? post.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/news/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      authors: post.author_name ? [post.author_name] : undefined,
      ...(post.cover_image ? { images: [{ url: post.cover_image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const kindLabel = { news: "News", story: "Story", report: "Report" } as const;
const kindTone = { news: "neutral", story: "azure", report: "navy" } as const;

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await listPosts({
    page: 1,
    perPage: 3,
    kind: post.kind,
    excludeId: post.id,
  });

  const trail = [
    { name: "Home", href: "/" },
    { name: "News", href: "/news" },
    { name: post.title, href: `/news/${post.slug}` },
  ];

  return (
    <>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd trail={trail} />

      <article>
        <header className="border-b border-navy-100 bg-azure-50/50">
          <div className="container-page py-12 lg:py-16">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm font-semibold">
              <Link href="/news" className="text-azure-700 underline-offset-4 hover:underline">
                ← All updates
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={kindTone[post.kind]}>{kindLabel[post.kind]}</Badge>
              <time
                dateTime={post.published_at ?? undefined}
                className="text-sm font-semibold text-navy-600"
              >
                {formatDate(post.published_at)}
              </time>
              <span className="text-sm text-navy-400" aria-hidden="true">
                ·
              </span>
              <span className="text-sm font-semibold text-navy-600">
                {post.reading_mins} min read
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] text-navy-950 sm:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-navy-700">
                {post.excerpt}
              </p>
            )}

            {post.author_name && (
              <p className="mt-6 text-sm font-semibold text-navy-600">
                By <span className="text-navy-950">{post.author_name}</span>
              </p>
            )}
          </div>
        </header>

        <div className="container-page py-12 lg:py-16">
          <div className="mx-auto max-w-3xl">
            <MediaSlot
              src={post.cover_image}
              alt={post.cover_alt || post.title}
              label={`Lead image — ${post.title}`}
              ratio="wide"
              priority
              sizes="(min-width: 1024px) 48rem, 100vw"
            />

            {/* Body is stored as plain text with blank-line paragraphs and
                markdown-style "## " headings. Rendered structurally rather than
                with dangerouslySetInnerHTML, so editor content can never inject
                markup into the page. */}
            <div className="prose-ucc mt-10">
              {post.body.split("\n\n").map((block, i) => {
                const text = block.trim();
                if (!text) return null;
                if (text.startsWith("## ")) {
                  return <h2 key={i}>{text.slice(3)}</h2>;
                }
                if (text.startsWith("### ")) {
                  return <h3 key={i}>{text.slice(4)}</h3>;
                }
                return <p key={i}>{text}</p>;
              })}
            </div>

            {/* Every article ends with a route to help. Someone reading about
                HIV or GBV may be reading it for themselves. */}
            <aside className="mt-14 rounded-card border-2 border-azure-200 bg-azure-50/60 p-6">
              <h2 className="text-lg font-extrabold text-navy-950">Need support yourself?</h2>
              <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                Our services are free and confidential. If you are in immediate danger, call 999.
                Our hotline{" "}
                <a
                  href={`tel:${site.help.lines[0].number.replace(/\s/g, "")}`}
                  className="font-bold text-azure-700 underline underline-offset-4"
                >
                  {site.help.lines[0].number}
                </a>{" "}
                is confidential — call or text.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <ButtonLink href="/get-help" size="md">
                  Find services near you
                </ButtonLink>
                <ButtonLink href="/contact" size="md" variant="outline">
                  Contact us
                </ButtonLink>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {related.items.length > 0 && (
        <Section tone="tint">
          <SectionHeading
            title={`More ${kindLabel[post.kind].toLowerCase()}s`}
          />
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {related.items.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
