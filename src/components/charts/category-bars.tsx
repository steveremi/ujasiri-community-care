"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

import { cn, formatMoney, formatNumber } from "@/lib/utils";

/**
 * Standing columns — magnitude across named categories.
 *
 * Columns rather than a pie, deliberately. Where this renders reach by
 * programme the figures overlap: the same household reached for HIV testing is
 * often screened for TB as well, so they do not partition a total, and anything
 * that drew them as shares of one whole would assert a sum the data does not
 * support. Height on a shared baseline compares magnitudes without implying
 * they add up. It is also the right form when a set genuinely does partition a
 * whole but has too many categories to colour safely — seven counties cannot be
 * told apart as seven pie slices.
 *
 * One hue for every column — navy, the brand backbone. Shading by value would
 * restate height as lightness and spend the only free encoding channel on
 * information the column already carries; identity comes from the label sitting
 * directly beneath each one. Green, amber and red are held back for status, so
 * a coloured column here would read as a judgement it is not making.
 *
 * Columns grow from the baseline on scroll, and not at all under
 * prefers-reduced-motion. Categories can be switched off; the scale rescales to
 * what is left, and a switched-off column keeps its place so it can be switched
 * back on.
 */

/** How values are rendered. A name, not a function — see `DonutChart`. */
export type ValueFormat = "money" | "number";

const FORMATTERS: Record<ValueFormat, (n: number) => string> = {
  money: (cents) => formatMoney(cents, "KES", { compact: true }),
  number: (n) => formatNumber(n),
};

export interface BarDatum {
  id: string | number;
  label: string;
  value: number;
  /** Optional link — rendered separately from the toggle control. */
  href?: string;
}

/** Plot height in pixels. Columns are sized as a percentage of this. */
const PLOT_HEIGHT = 240;

export function CategoryBars({
  title,
  data,
  /** Column heading for the value in the table view. */
  valueLabel = "People reached",
  /** Column heading for the category in the table view. */
  categoryLabel = "Category",
  /** How to render each value. See `ValueFormat`. */
  format = "number",
  className,
}: {
  title: string;
  data: BarDatum[];
  valueLabel?: string;
  categoryLabel?: string;
  format?: ValueFormat;
  className?: string;
}) {
  const fmt = FORMATTERS[format];

  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | number | null>(null);
  const [hidden, setHidden] = useState<ReadonlySet<string | number>>(new Set());

  /**
   * Columns grow from the baseline when the figure scrolls into view.
   *
   * Only the entrance is driven from here, and the effect hands control back to
   * React once it has run — the real heights live in the `style` prop, so a
   * category being switched off re-animates through the same CSS transition
   * instead of being frozen by a stale inline style.
   */
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const bars = Array.from(node.querySelectorAll<HTMLElement>("[data-bar]"));
    if (bars.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    for (const bar of bars) bar.style.height = "0%";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        bars.forEach((bar, i) => {
          bar.style.transitionDelay = `${i * 70}ms`;
          bar.style.removeProperty("height");
        });
        // Drop the stagger once it has played, so later filtering is immediate.
        window.setTimeout(
          () => {
            for (const bar of bars) bar.style.removeProperty("transition-delay");
          },
          bars.length * 70 + 1000,
        );
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [data.length]);

  const present = data.filter((d) => d.value > 0);
  if (present.length === 0) return null;

  const visible = present.filter((d) => !hidden.has(d.id));
  // Scale to what is actually shown, so switching the tallest column off makes
  // the rest legible instead of leaving them squashed against the floor.
  const max = Math.max(...visible.map((d) => d.value), 1);
  const filtered = hidden.size > 0;

  const toggle = (id: string | number) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      // The last visible column stays on — an empty plot is a bug, not a state.
      else if (visible.length > 1) next.add(id);
      return next;
    });

  return (
    <figure
      ref={ref}
      className={cn(
        "flex h-full flex-col rounded-card border-2 border-navy-100 bg-white p-7 shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <figcaption className="text-lg font-extrabold tracking-tight text-navy-950">
          {title}
        </figcaption>
        {filtered && (
          <button
            type="button"
            onClick={() => setHidden(new Set())}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.75rem] font-bold text-azure-700 transition-colors hover:bg-azure-50"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Show all
          </button>
        )}
      </div>

      {/* Scrolls rather than crushing: a squeezed column chart is unreadable,
          and these labels are long. */}
      <div className="mt-7 flex-1 overflow-x-auto pb-1">
        <ul className="flex min-w-max items-end gap-3" style={{ height: `${PLOT_HEIGHT}px` }}>
          {present.map((d) => {
            const off = hidden.has(d.id);
            const height = off ? 0 : Math.max((d.value / max) * 100, 1.5);
            const isActive = active === d.id && !off;

            return (
              <li
                key={d.id}
                className="flex h-full w-24 flex-col justify-end"
                onMouseEnter={() => setActive(d.id)}
                onMouseLeave={() => setActive(null)}
              >
                {/* Value sits above its own column — a direct label, so the
                    number never depends on reading a scale off an axis. */}
                <span
                  className={cn(
                    "mb-2 text-center font-mono text-[0.8125rem] font-extrabold tabular-nums transition-colors",
                    off ? "text-navy-300" : "text-navy-950",
                  )}
                >
                  {off ? "—" : fmt(d.value)}
                </span>

                <div
                  data-bar=""
                  style={{ height: `${height}%` }}
                  className={cn(
                    "w-full rounded-t transition-[height,background-color] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isActive ? "bg-navy-500" : "bg-navy-600",
                  )}
                />
              </li>
            );
          })}
        </ul>

        {/* Baseline, then the category labels hanging beneath it. Each label is
            the control that switches its own column off. */}
        <div className="border-t-2 border-navy-200" />

        <ul className="flex min-w-max gap-3 pt-2.5">
          {present.map((d) => {
            const off = hidden.has(d.id);
            return (
              <li key={d.id} className="w-24">
                <button
                  type="button"
                  onClick={() => toggle(d.id)}
                  onMouseEnter={() => setActive(d.id)}
                  onMouseLeave={() => setActive(null)}
                  aria-pressed={!off}
                  // One line, never two: a label that wraps pushes its
                  // neighbours out of step with the columns above them. The
                  // full name stays available on hover and in the table.
                  title={d.label}
                  className={cn(
                    "block w-full truncate rounded-md px-1 py-1 text-center text-[0.75rem] font-bold leading-tight transition-colors",
                    off
                      ? "text-navy-300 line-through hover:bg-navy-50"
                      : active === d.id
                        ? "bg-azure-50 text-azure-700"
                        : "text-navy-700 hover:bg-navy-50",
                  )}
                >
                  {d.label}
                </button>

                {/* The link is kept separate from the toggle: one control must
                    not do two things. */}
                {d.href && !off && (
                  <p className="mt-1 text-center">
                    <Link
                      href={d.href}
                      className="text-[0.6875rem] font-semibold text-azure-700 underline-offset-2 hover:underline"
                    >
                      View
                    </Link>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 text-[0.6875rem] font-medium text-navy-400">
        Select a label to remove it from the chart.
      </p>

      {/* The table always lists every category, filtered or not. */}
      <details className="mt-4 border-t border-navy-100 pt-4">
        <summary className="cursor-pointer text-sm font-bold text-azure-700 hover:underline">
          View as a table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[24rem] text-left text-sm">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b border-navy-100">
                <th scope="col" className="py-2 font-bold text-navy-700">{categoryLabel}</th>
                <th scope="col" className="py-2 text-right font-bold text-navy-700">
                  {valueLabel}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {present.map((d) => (
                <tr key={d.id}>
                  <th scope="row" className="py-2 font-medium text-navy-800">{d.label}</th>
                  <td className="py-2 text-right font-mono tabular-nums text-navy-700">
                    {fmt(d.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
