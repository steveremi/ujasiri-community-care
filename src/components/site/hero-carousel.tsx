"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { HeroPlaceholder } from "@/components/site/hero-placeholder";
import { cn } from "@/lib/utils";

/**
 * The hero slideshow.
 *
 * Twelve slides, cross-fading with a slow Ken Burns drift on whichever is
 * active. Design decisions worth knowing:
 *
 *  - Cross-fade, not horizontal slide. A sideways push fights the page's own
 *    scroll direction and reads as jumpy; opacity does not.
 *  - Only the first slide gets `priority`. Eagerly loading twelve hero images
 *    would wreck Largest Contentful Paint on the mobile connections most of
 *    our visitors use, which is the opposite of what a hero is for.
 *  - Auto-advance pauses on hover, on keyboard focus, and whenever the tab is
 *    hidden — a carousel that keeps cycling in a background tab is just
 *    burning battery.
 *  - `prefers-reduced-motion` stops the rotation entirely and shows one still
 *    image. Vestibular disorders are real and a moving background is a known
 *    trigger.
 *  - The whole thing is `aria-roledescription="carousel"` with a live region,
 *    so a screen-reader user is told the slide changed rather than silently
 *    losing the context.
 *
 * Until real photographs exist, each slide renders a distinct navy/azure
 * gradient panel with its caption, so the motion and pacing are fully
 * reviewable now. Drop a `src` into any slide and it takes over.
 */

export interface HeroSlide {
  /** Path to the photograph. Leave undefined to render the styled placeholder. */
  src?: string;
  alt: string;
  /** Overlaid on the slide, and used as the photography brief. */
  caption: string;
  /** Programme this image belongs to — shown as a small kicker. */
  kicker: string;
  /** Supporting line, animated in beneath the caption. */
  line?: string;
}

/**
 * Twelve slots covering all five programmes.
 * Replace `src` with a real image path as photography is collected.
 */
export const defaultHeroSlides: HeroSlide[] = [
  {
    kicker: "HIV prevention",
    caption: "We come to you",
    line: "Community testing, offered door to door — free, private, and no appointment.",
    alt: "A community health worker offering HIV testing at a household visit",
  },
  {
    kicker: "Adolescent girls",
    caption: "Somewhere to ask anything",
    line: "Safe spaces led by mentors barely older than the girls in them.",
    alt: "Adolescent girls in a facilitated safe-space session",
  },
  {
    kicker: "TB screening",
    caption: "Finding what the clinic never sees",
    line: "A cough of more than two weeks, screened at your door.",
    alt: "A health worker screening a household for TB symptoms",
  },
  {
    kicker: "Cancer awareness",
    caption: "Screening that comes to the village",
    line: "Run with partner facilities, and nobody turned away.",
    alt: "Women arriving at a community cervical cancer screening day",
  },
  {
    kicker: "GBV response",
    caption: "At your pace, on your terms",
    line: "You decide what happens next. Nobody is told anything.",
    alt: "A counsellor talking with a client in a private safe space",
  },
  {
    kicker: "Menstrual health",
    caption: "Three years in one kit",
    line: "Reusable pads that end the monthly reason to miss school.",
    alt: "Reusable sanitary pad kits prepared for distribution",
  },
  {
    kicker: "Referral",
    caption: "We walk you to the door",
    line: "Same-day, accompanied, and you are expected when you arrive.",
    alt: "A community health worker accompanying a client to a health facility",
  },
  {
    kicker: "HPV vaccination",
    caption: "The dose that actually protects",
    line: "We follow up on the second one, where most programmes lose girls.",
    alt: "A nurse preparing HPV vaccinations at a school session",
  },
  {
    kicker: "Outreach",
    caption: "We test after dark",
    line: "Because nobody should lose a day's wages to get a result.",
    alt: "An evening community outreach testing session",
  },
  {
    kicker: "Partnership",
    caption: "Alongside county health teams",
    line: "Inside the system, not around it — so it survives us.",
    alt: "UCC staff working alongside county health workers",
  },
  {
    kicker: "Follow-up",
    caption: "One week. One month. Six months.",
    line: "Staying in care is the hard part. That is the part we do.",
    alt: "A community linkage officer making a follow-up call",
  },
  {
    kicker: "Community",
    caption: "Courage, carried together",
    line: "Ujasiri means courage. Nobody should need it alone.",
    alt: "Members of a community gathered at a health education session",
  },
];

const INTERVAL = 5200;

export function HeroCarousel({
  slides = defaultHeroSlides,
  className,
  /** Fill the parent as a background layer rather than sit in a card. */
  fill = false,
}: {
  slides?: HeroSlide[];
  className?: string;
  fill?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!playing || reduced || slides.length < 2) return;

    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, reduced, slides.length]);

  // A carousel cycling in a hidden tab helps nobody and costs battery.
  useEffect(() => {
    const onVisibility = () => setPlaying(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const active = slides[index];

  return (
    <div
      className={cn(
        "group bg-navy-950",
        fill ? "absolute inset-0 overflow-hidden" : "relative overflow-hidden rounded-card shadow-lift",
        className,
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label="Our work in pictures"
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      onFocusCapture={() => setPlaying(false)}
      onBlurCapture={() => setPlaying(true)}
    >
      <div
        className={cn(
          "relative w-full",
          fill ? "h-full" : "aspect-4/3 lg:aspect-3/4 xl:aspect-4/5",
        )}
      >
        {slides.map((slide, i) => {
          const current = i === index;
          return (
            <div
              key={i}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-out",
                current ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={!current}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
            >
              {slide.src ? (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  className={cn(
                    "object-cover",
                    current && !reduced && "animate-kenburns",
                  )}
                />
              ) : (
                // Greyscale placeholder scene — unique per slide, and plainly
                // not a photograph. See hero-placeholder.tsx.
                <div
                  className={cn("size-full", current && !reduced && "animate-kenburns")}
                >
                  <HeroPlaceholder index={i} />
                </div>
              )}
            </div>
          );
        })}

        {/* Legibility scrim for the overlaid caption. */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0",
            fill
              ? "bg-[linear-gradient(to_right,rgb(0_16_58/0.94)_0%,rgb(0_16_58/0.86)_40%,rgb(0_16_58/0.55)_72%,rgb(0_16_58/0.42)_100%)]"
              : "bg-gradient-to-t from-navy-950 via-navy-950/35 to-transparent",
          )}
        />

        {/* Rotating copy. In fill mode it sits low-right, clear of the page's
            own <h1> — which stays stable, because a heading that rewrites
            itself mid-read is hostile to screen-reader users. The live region
            announces each change politely instead. */}
        <div
          className={cn(
            "absolute p-6 sm:p-8",
            fill
              ? "bottom-16 right-0 hidden max-w-sm text-right lg:block"
              : "inset-x-0 bottom-0",
          )}
        >
          {/* `key` on the wrapper restarts the entrance animation each slide. */}
          <div key={index} className="animate-fade-up">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-azure-300">
              {active.kicker}
            </p>
            <p
              className="mt-2.5 text-2xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-3xl"
              aria-live="polite"
            >
              {active.caption}
            </p>
            {active.line && (
              <p className="mt-2.5 text-sm font-medium leading-relaxed text-white/80 sm:text-[0.9375rem]">
                {active.line}
              </p>
            )}
          </div>
        </div>

        {/* Controls — visible on hover and always on touch, never hidden from
            keyboard users. */}
        <div
          className={cn(
            "absolute inset-x-0 flex justify-between p-4 transition-opacity",
            "opacity-0 focus-within:opacity-100 group-hover:opacity-100 max-lg:opacity-100",
            fill ? "bottom-0 z-20" : "top-0",
          )}
        >
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="grid size-10 place-items-center rounded-full bg-navy-950/50 text-white backdrop-blur-sm transition-colors hover:bg-navy-950/80"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              className="grid size-10 place-items-center rounded-full bg-navy-950/50 text-white backdrop-blur-sm transition-colors hover:bg-navy-950/80"
            >
              {playing ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="grid size-10 place-items-center rounded-full bg-navy-950/50 text-white backdrop-blur-sm transition-colors hover:bg-navy-950/80"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress dots, kept clear of the caption's max-width column. */}
      <div
        className={cn(
          "absolute z-20 flex max-w-[45%] flex-wrap justify-end gap-1.5",
          fill ? "bottom-7 right-6 sm:right-10" : "bottom-6 right-6 sm:bottom-8 sm:right-8",
        )}
      >
        {slides.map((slide, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}: ${slide.caption}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-7 bg-azure-400" : "w-1.5 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </div>
  );
}
