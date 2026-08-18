"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Reveals its children as they scroll into view.
 *
 * The effect drives the DOM node directly rather than React state. That is
 * deliberate on both counts:
 *
 *  - Synchronising with an external system — here, the browser's layout and
 *    the IntersectionObserver — is precisely what an effect is for. Routing it
 *    through state would schedule a render pass per element per scroll.
 *  - It lets the markup ship VISIBLE and be hidden only once we know scripting
 *    is available and motion is wanted. If JavaScript never runs, the content
 *    is simply there. An animation wrapper must never be the reason a page
 *    renders blank.
 *
 * Under prefers-reduced-motion nothing is hidden and no observer is created.
 */

const HIDDEN = ["opacity-0"] as const;

const DIRECTION = {
  up: "translate-y-6",
  left: "-translate-x-6",
  right: "translate-x-6",
  none: "",
} as const;

export function Reveal({
  children,
  className,
  /** Stagger, in milliseconds, for items in a sequence. */
  delay = 0,
  from = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: keyof typeof DIRECTION;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const offset = DIRECTION[from];
    const hiddenClasses = [...HIDDEN, ...(offset ? [offset] : [])];

    node.classList.add(...hiddenClasses);
    node.style.transitionProperty = "opacity, transform";
    node.style.transitionDuration = "700ms";
    node.style.transitionTimingFunction = "cubic-bezier(0.22, 1, 0.36, 1)";
    node.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.classList.remove(...hiddenClasses);
        // One-shot: this is an entrance, not a state that should re-toggle
        // every time the element passes the fold.
        observer.disconnect();
      },
      // Fire slightly before it reaches the viewport, so the movement has
      // finished by the time it is properly in view.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, from]);

  return (
    <div ref={ref} className={cn("will-change-[opacity,transform]", className)}>
      {children}
    </div>
  );
}
