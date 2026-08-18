import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { ImageRotator } from "@/components/media/image-rotator";
import { cn } from "@/lib/utils";

/**
 * Standard page header. Every inner page opens the same way so the site reads
 * as one thing, and so a visitor always knows where they are.
 */
export function PageHero({
  title,
  lead,
  breadcrumbs,
  children,
  tone = "light",
  /** Rotating photographs behind the heading. Omit for a plain header. */
  images,
  /** Keeps two headers on adjacent pages from showing the same frame. */
  imageSeed = 0,
}: {
  title: string;
  lead?: ReactNode;
  breadcrumbs?: { name: string; href: string }[];
  children?: ReactNode;
  tone?: "navy" | "light";
  images?: string[];
  imageSeed?: number;
}) {
  // A photographic header is always treated as dark, whatever the tone prop
  // says — white text over an arbitrary photograph needs the dark scrim.
  const hasImages = Boolean(images && images.length > 0);
  const dark = tone === "navy" || hasImages;

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b",
        dark ? "bg-navy-950" : "border-azure-100 bg-gradient-to-b from-azure-50 to-white",
      )}
    >
      {hasImages && (
        <>
          <ImageRotator
            images={images!}
            alt=""
            offset={imageSeed}
            interval={5800}
            position="absolute"
            className="inset-0 h-full"
            sizes="100vw"
          />
          {/* Weighted left, where the heading sits, and dark enough at the top
              for the translucent header to stay legible over it. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_right,rgb(0_16_58/0.88)_0%,rgb(0_16_58/0.62)_42%,rgb(0_16_58/0.3)_72%,rgb(0_16_58/0.2)_100%)]"
          />
        </>
      )}

      {dark && !hasImages && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-azure-800)_0%,transparent_60%)] opacity-70"
        />
      )}
      <div className={cn("container-page relative", hasImages ? "py-20 lg:py-28" : "py-14 lg:py-20")}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm font-semibold">
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight
                      className={cn("size-3.5", dark ? "text-white/40" : "text-navy-400")}
                      aria-hidden="true"
                    />
                  )}
                  {i === breadcrumbs.length - 1 ? (
                    <span className={dark ? "text-white/60" : "text-navy-500"} aria-current="page">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className={cn(
                        "underline-offset-4 hover:underline",
                        dark ? "text-azure-300" : "text-azure-700",
                      )}
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}


        <h1
          className={cn(
            "mt-4 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem]",
            dark ? "text-white" : "text-navy-950",
          )}
        >
          {title}
        </h1>

        {lead && (
          <div
            className={cn(
              "mt-6 max-w-2xl text-lg font-medium leading-relaxed",
              dark ? "text-white/75" : "text-navy-700",
            )}
          >
            {lead}
          </div>
        )}

        {children && <div className="mt-9">{children}</div>}
      </div>
    </section>
  );
}
