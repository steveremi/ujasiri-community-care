import Link from "next/link";

import { ImageRotator } from "@/components/media/image-rotator";
import { MediaSlot } from "@/components/media/media-slot";
import { CARDS, deal } from "@/lib/gallery";
import { Badge } from "@/components/ui/primitives";
import type { Post } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const kindLabel = {
  news: "News",
  story: "Story",
  report: "Report",
} as const;

const kindTone = {
  news: "neutral",
  story: "azure",
  report: "navy",
} as const;

export function PostCard({
  post,
  featured = false,
  className,
}: {
  post: Post;
  featured?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-card border-2 border-navy-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift",
        className,
      )}
    >
      {post.cover_image ? (
        <MediaSlot
          src={post.cover_image}
          alt={post.cover_alt || post.title}
          ratio={featured ? "wide" : "video"}
          rounded={false}
          sizes={featured ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
          imageClassName="transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
      ) : (
        <ImageRotator
          images={deal(post.id, 3, 5, CARDS)}
          alt={post.cover_alt || post.title}
          offset={post.id % 7}
          className={featured ? "aspect-16/10" : "aspect-video"}
          sizes={featured ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
        />
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone={kindTone[post.kind]}>{kindLabel[post.kind]}</Badge>
          <time
            dateTime={post.published_at ?? undefined}
            className="text-[0.8125rem] text-navy-500"
          >
            {formatDate(post.published_at)}
          </time>
          <span className="text-[0.8125rem] text-navy-400" aria-hidden="true">
            ·
          </span>
          <span className="text-[0.8125rem] text-navy-500">{post.reading_mins} min read</span>
        </div>

        <h3
          className={cn(
            "mt-4 font-extrabold leading-snug text-navy-950",
            featured ? "text-2xl" : "text-lg",
          )}
        >
          <Link
            href={`/news/${post.slug}`}
            className="after:absolute after:inset-0 group-hover:text-navy-800"
          >
            {post.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-navy-600">
          {post.excerpt}
        </p>

        {post.author_name && (
          <p className="mt-5 border-t border-navy-100 pt-4 text-[0.8125rem] text-navy-500">
            By <span className="font-medium text-navy-700">{post.author_name}</span>
          </p>
        )}
      </div>
    </article>
  );
}
