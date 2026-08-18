"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { HeroPlaceholder } from "@/components/site/hero-placeholder";
import { cn } from "@/lib/utils";

/**
 * A slot that cycles through a set of photographs.
 *
 * Used anywhere a single static image would otherwise sit forever. Two
 * decisions worth keeping:
 *
 *  - Each instance starts at a different offset and runs on a slightly
 *    different interval. Without that, every rotator on the page changes in
 *    lockstep, which reads as a glitch rather than as movement.
 *  - Only the visible frame is eager; the rest load lazily. A page with four
 *    rotators of eight images each must not fetch thirty-two files up front on
 *    a metered mobile connection.
 *
 * Rotation stops entirely under prefers-reduced-motion, showing the first
 * image as a still.
 */
export function ImageRotator({
  images,
  alt,
  className,
  /**
   * Positioning. Kept as a prop rather than baked into the base class,
   * because a `position` utility passed via className cannot reliably
   * override one already in the class list — CSS source order decides the
   * winner, not the order the classes are written in.
   */
  position = "relative",
  imageClassName,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  /** Milliseconds between changes. Jittered per instance. */
  interval = 5000,
  /** Where in the set this instance begins. Keeps neighbours out of sync. */
  offset = 0,
  priority = false,
  overlay = false,
}: {
  images: string[];
  alt: string;
  className?: string;
  position?: "relative" | "absolute";
  imageClassName?: string;
  sizes?: string;
  interval?: number;
  offset?: number;
  priority?: boolean;
  overlay?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced || images.length < 2) return;
    // The jitter is derived from the offset rather than random, so the server
    // and client agree and nothing re-renders differently after hydration.
    const jitter = (offset % 5) * 420;
    const id = setInterval(() => setIndex((i) => i + 1), interval + jitter);
    return () => clearInterval(id);
  }, [reduced, images.length, interval, offset]);

  // No photographs available — either none supplied, or stock imagery has been
  // switched off in lib/gallery.ts. Fall back to generated artwork rather than
  // leaving a hole in the layout.
  if (images.length === 0) {
    return (
      <div className={cn(position, "overflow-hidden bg-navy-100", className)}>
        <HeroPlaceholder index={offset} />
        {overlay && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/10 to-transparent"
          />
        )}
      </div>
    );
  }

  const current = (index + offset) % images.length;

  return (
    <div className={cn(position, "overflow-hidden bg-navy-100", className)}>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === current ? alt : ""}
          fill
          sizes={sizes}
          priority={priority && i === offset % images.length}
          loading={priority && i === offset % images.length ? undefined : "lazy"}
          aria-hidden={i !== current}
          className={cn(
            // object-position biased above centre: on wide, short slots a
            // centred crop cuts people's heads off, because that is where
            // heads sit in a portrait-ish source frame.
            "object-cover object-[center_32%] transition-all ease-[cubic-bezier(0.22,1,0.36,1)]",
            i === current
              ? "scale-100 opacity-100 duration-[1400ms]"
              : "scale-[1.04] opacity-0 duration-[900ms]",
            imageClassName,
          )}
        />
      ))}

      {overlay && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/10 to-transparent"
        />
      )}
    </div>
  );
}
