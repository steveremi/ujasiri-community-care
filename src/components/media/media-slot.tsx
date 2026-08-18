import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * An image slot that looks deliberate whether or not a photograph exists yet.
 *
 * With `src`, it renders an optimised next/image. Without one, it renders a
 * branded placeholder that states what photograph belongs there — so the page
 * reviews as a finished design rather than a broken one, and whoever collects
 * the photography has a brief attached to every slot.
 *
 * `alt` is required and not optional-with-a-default on purpose. On a site
 * covering HIV, TB and GBV, a screen-reader user deserves the same description
 * as everyone else, and an empty alt is a decision that should be made
 * explicitly (pass alt="" for purely decorative imagery).
 */

export type Ratio = "square" | "video" | "portrait" | "wide" | "hero" | "banner";

const ratios: Record<Ratio, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/10]",
  hero: "aspect-[4/3] lg:aspect-[3/4]",
  banner: "aspect-[21/9]",
};

interface MediaSlotProps {
  src?: string | null;
  alt: string;
  /** Shown in the placeholder to brief whoever supplies the photograph. */
  label?: string;
  ratio?: Ratio;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  rounded?: boolean;
  /** Darkens the image so overlaid white text stays legible. */
  overlay?: boolean;
}

export function MediaSlot({
  src,
  alt,
  label,
  ratio = "video",
  className,
  imageClassName,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  rounded = true,
  overlay = false,
}: MediaSlotProps) {
  const shell = cn(
    "relative overflow-hidden bg-navy-50",
    ratios[ratio],
    rounded && "rounded-card",
    className,
  );

  if (src) {
    return (
      <div className={shell}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          // Biased above centre so a wide crop does not cut off heads.
          className={cn("object-cover object-[center_32%]", imageClassName)}
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/25 to-transparent" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        shell,
        "grid place-items-center border border-dashed border-navy-200",
        "bg-[linear-gradient(135deg,var(--color-navy-50)_0%,var(--color-azure-50)_100%)]",
      )}
      // Placeholders carry no information a screen reader needs.
      role="presentation"
    >
      <div className="flex flex-col items-center gap-2.5 px-6 text-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="size-7 text-azure-600/70"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <circle cx="8.5" cy="9.5" r="1.75" />
          <path d="m3.5 17 4.6-4.4a2 2 0 0 1 2.8 0L15 17M13.5 15l2.2-2.1a2 2 0 0 1 2.8 0l2 1.9" />
        </svg>
        {label && (
          <p className="max-w-[26ch] text-xs font-medium leading-snug text-navy-500">{label}</p>
        )}
      </div>
    </div>
  );
}

/**
 * A gallery-style cluster of slots. Used on programme and project pages where
 * a single hero image would undersell the work.
 */
export function MediaCluster({
  items,
  className,
}: {
  items: { src?: string | null; alt: string; label?: string }[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", className)}>
      {items.map((item, i) => (
        <MediaSlot
          key={i}
          src={item.src}
          alt={item.alt}
          label={item.label}
          ratio={i === 0 ? "wide" : "square"}
          sizes="(min-width: 1024px) 25vw, 50vw"
          className={i === 0 ? "col-span-2" : undefined}
        />
      ))}
    </div>
  );
}
