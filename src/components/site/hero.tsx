"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { HeroPlaceholder } from "@/components/site/hero-placeholder";
import type { HeroSlide } from "@/components/site/hero-carousel";
import { heroSlides } from "@/lib/hero-slides";
import { heroNav } from "@/lib/site";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The homepage hero.
 *
 * The photography carries this section. There is no large overlaid headline —
 * it obscured the images without adding anything the page below does not
 * already say. What remains is a compact caption naming the current
 * photograph, the two calls to action, and a rail of secondary destinations.
 *
 * Behaviour worth not re-breaking:
 *
 *  - It plays continuously. There is no pause control and no pause-on-hover: a
 *    full-viewport hero sits under the pointer most of the time, so hover
 *    pausing meant it effectively never advanced.
 *  - The Ken Burns drift is keyed to the advancing counter. Keyed to the slide's
 *    own index instead, the element never remounts, the animation runs once at
 *    mount, and every later slide sits perfectly still.
 *  - Copy is vertically centred with the image, not pinned to the bottom.
 *
 * Accessibility:
 *  - A stable, visually-hidden <h1> is the page's one real heading. The rotating
 *    display headline is aria-hidden — a heading that rewrites itself mid-read
 *    is disorienting under a screen reader.
 *  - Rotation stops entirely under prefers-reduced-motion, which is why no
 *    pause control is needed: the people who require one never see motion.
 */


const INTERVAL = 6500;

export function Hero({ slides = heroSlides }: { slides?: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Slides and messages are different lengths; each advances on its own
  // modulus so the pairings keep cycling rather than locking after the shorter
  // list runs out.
  const slideIndex = index % slides.length;
  const slide = slides[slideIndex];

  const go = useCallback((delta: number) => setIndex((i) => Math.max(0, i + delta)), []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) return;
    timer.current = setInterval(() => setIndex((i) => i + 1), INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduced]);

  const control =
    "grid size-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 " +
    "backdrop-blur-sm transition-colors hover:bg-white/25";

  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden bg-navy-950">
      {/* ------------------------------------------------------------ Images */}
      <div
        className="absolute inset-0"
        role="region"
        aria-roledescription="carousel"
        aria-label="Our work in pictures"
      >
        {slides.map((s, i) => {
          const current = i === slideIndex;
          return (
            <div
              key={i}
              aria-hidden="true"
              className={cn(
                // Fade paired with a barely-perceptible scale. The outgoing
                // frame settles rather than blinking out, which is what makes
                // the change read as a dissolve instead of a cut.
                "absolute inset-0 transition-all ease-[cubic-bezier(0.22,1,0.36,1)]",
                current
                  ? "scale-100 opacity-100 duration-[1600ms]"
                  : "scale-[1.03] opacity-0 duration-[1100ms]",
              )}
            >
              {/* Keyed on `index`, not `i` — remounting is what restarts the
                  drift on every advance. */}
              <div
                key={current ? index : `idle-${i}`}
                className={cn("size-full", current && !reduced && "animate-kenburns")}
              >
                {s.src ? (
                  <Image
                    src={s.src}
                    alt=""
                    fill
                    sizes="100vw"
                    // Only the first two are eager. Loading eighteen hero
                    // images up front would wreck Largest Contentful Paint on
                    // the mobile connections most visitors are on.
                    priority={i === 0}
                    loading={i <= 1 ? undefined : "lazy"}
                    // The hero is tall, so centre is correct here — the upward
                    // bias the rotator applies would push subjects off the top.
                    className="object-cover object-center"
                  />
                ) : (
                  <HeroPlaceholder index={i} />
                )}
              </div>
            </div>
          );
        })}

        {/* Two scrims. The horizontal one carries the headline; the vertical
            one darkens the top strip so the translucent navbar always has
            something dark behind it. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgb(0_16_58/0.95)_0%,rgb(0_16_58/0.86)_44%,rgb(0_16_58/0.55)_76%,rgb(0_16_58/0.4)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgb(0_16_58/0.85)_0%,transparent_100%)]"
        />
      </div>

      {/* -------------------------------------------------------------- Copy */}
      {/* The large rotating headline was removed so the photography reads
          clearly. The organisation is identified by a visually-hidden <h1> for
          search engines and screen readers; the rotating caption now lives
          only in the compact right-hand rail. */}
      {/* Top padding clears the floating header; the block sits low in the frame
          so the photography reads above it. */}
      <div className="container-page relative z-10 flex w-full flex-col justify-end pb-8 pt-32 lg:pb-10 lg:pt-40">
        <h1 className="sr-only">
          Ujasiri Community Care — HIV and TB prevention, cancer awareness, gender-based
          violence support and adolescent girls&apos; health in Kenya
        </h1>

        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/get-help" size="lg">
              Find help near you
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              href="/donate"
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/20"
            >
              Donate
            </ButtonLink>
          </div>

          {/* Right rail: names what the current photograph shows. Kept small
              deliberately — it annotates the image rather than competing with
              it. */}
          <aside className="lg:max-w-xs lg:text-right">
            <div key={`rail-${index}`} className="animate-fade-up">
              <p className="text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">
                {slide.caption}
              </p>
              {slide.line && (
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">
                  {slide.line}
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center gap-3 lg:justify-end">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className={control}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className={control}
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
              <span className="font-mono text-xs font-bold text-white/60">
                {String(slideIndex + 1).padStart(2, "0")}
                <span className="text-white/35">/{String(slides.length).padStart(2, "0")}</span>
              </span>
            </div>
          </aside>
        </div>

        {/* Secondary navigation rail across the foot of the hero. */}
        <nav aria-label="Explore the site" className="mt-8 border-t border-white/15 pt-4">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {heroNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 text-sm font-bold text-white/75 transition-colors hover:text-white"
                >
                  {item.label}
                  <ArrowRight
                    className="size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

    </section>
  );
}
