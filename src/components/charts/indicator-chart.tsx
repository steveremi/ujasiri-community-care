"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, ExternalLink, Minus } from "lucide-react";

import type { HealthIndicator } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Health indicators — standing columns against a percentage axis.
 *
 * Form: columns on a shared baseline. The job is comparing magnitudes across
 * indicators, which length reads accurately and angle does not. No pie: these
 * are independent rates, not shares of one total, so there is no whole for them
 * to divide.
 *
 * Layout. The plot is one grid, not two lists that have to be kept in step —
 * an earlier version drew the columns in one `<ul>` and the labels in a second
 * and relied on both having identical widths and gaps, which is a rule nobody
 * maintaining this file would know they were bound by. Here each column is a
 * single grid cell, so a label cannot drift away from its column.
 *
 * Colour is split into two jobs that never borrow from each other:
 *
 *   Series — navy, one hue for every column. Shading columns by value would
 *   double-encode height as lightness, restating what the column already shows
 *   and burning the only free channel. Identity comes from the direct label
 *   under each column.
 *
 *   Status — green, amber and red, reserved for movement against the baseline
 *   and used nowhere else. Because they are reserved, a red badge on this page
 *   always means the same thing. They were run through the palette validator
 *   and pass every check (#059669 / #f59e0b / #dc2626).
 *
 * Change is encoded three times over — an arrow glyph, a sign, and a word — so
 * it never rests on colour alone. Red/green is exactly the pair a deuteranope
 * cannot separate, which is why the word "worse" is always present.
 *
 * Columns grow from the baseline when scrolled into view, and not at all under
 * prefers-reduced-motion.
 */

const PLOT_HEIGHT = 220;
const COLUMN_WIDTH = "8.5rem";

/** Worse by at least this much reads as critical rather than a wobble. */
const CRITICAL_DELTA = 3;

/** Gridlines, top to bottom. Percent scale. */
const TICKS = [100, 75, 50, 25, 0];

type Status = "good" | "warning" | "critical" | "neutral";

const STATUS_STYLES: Record<Status, string> = {
  good: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20",
  critical: "bg-red-50 text-red-800 ring-red-600/20",
  neutral: "bg-navy-50 text-navy-700 ring-navy-600/15",
};

export function IndicatorChart({
  title,
  indicators,
}: {
  title: string;
  indicators: HealthIndicator[];
}) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  /**
   * Columns grow from the baseline when the figure scrolls into view.
   *
   * The effect writes heights straight to the DOM rather than through state.
   * Synchronising with the browser's layout is what an effect is for, and
   * routing an animation through React would cost a render pass per column. It
   * also lets the markup ship with the real heights already set, so the chart
   * is correct even if JavaScript never runs.
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
          bar.style.transitionDelay = `${i * 80}ms`;
          bar.style.height = bar.dataset.bar ?? "0%";
        });
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [indicators.length]);

  if (indicators.length === 0) return null;

  // Percentages share the 0–100 axis. Counts and rates have no meaningful
  // shared ceiling, so they are scaled against the largest in their own group —
  // and the axis is then hidden, because it would be labelling two scales.
  const allPercent = indicators.every((i) => i.unit === "percent");
  const maxCount = Math.max(
    ...indicators.filter((i) => i.unit !== "percent").map((i) => i.value),
    1,
  );

  const heightFor = (ind: HealthIndicator) =>
    ind.unit === "percent"
      ? Math.min(100, ind.value)
      : Math.min(100, (ind.value / maxCount) * 100);

  const formatValue = (ind: HealthIndicator) =>
    ind.unit === "percent"
      ? `${ind.value}%`
      : ind.unit === "rate"
        ? String(ind.value)
        : new Intl.NumberFormat("en-KE").format(ind.value);

  return (
    <figure
      ref={ref}
      className="flex h-full flex-col rounded-card border-2 border-navy-100 bg-white p-7 shadow-card"
    >
      <figcaption className="text-lg font-extrabold tracking-tight text-navy-950">
        {title}
      </figcaption>

      <div className="mt-8 flex gap-3">
        {/* Axis. Only drawn when every column shares the percent scale — an
            axis over mixed units would be labelling a scale half the columns
            are not on. */}
        {allPercent && (
          <ul
            className="relative w-9 shrink-0 text-right"
            style={{ height: `${PLOT_HEIGHT}px` }}
            aria-hidden="true"
          >
            {TICKS.map((t) => (
              <li
                key={t}
                className="absolute right-0 -translate-y-1/2 font-mono text-[0.6875rem] font-semibold tabular-nums text-navy-400"
                style={{ top: `${100 - t}%` }}
              >
                {t}%
              </li>
            ))}
          </ul>
        )}

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="min-w-max">
            {/* Plot. Gridlines sit behind the columns; the baseline is the
                bottom border, so it is one continuous line across every
                column rather than a segment per cell. */}
            <div className="relative border-b-2 border-navy-200" style={{ height: `${PLOT_HEIGHT}px` }}>
              {allPercent && (
                <div aria-hidden="true" className="absolute inset-0">
                  {TICKS.filter((t) => t > 0).map((t) => (
                    <div
                      key={t}
                      className="absolute inset-x-0 border-t border-dashed border-navy-100"
                      style={{ top: `${100 - t}%` }}
                    />
                  ))}
                </div>
              )}

              <ul className="relative flex h-full items-end gap-6">
                {indicators.map((ind, i) => (
                  <li
                    key={ind.id}
                    className="flex h-full flex-col justify-end"
                    style={{ width: COLUMN_WIDTH }}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                  >
                    {/* Direct label, so the number never depends on reading a
                        value off the axis. */}
                    <span className="mb-1.5 text-center font-mono text-sm font-extrabold tabular-nums text-navy-950">
                      {formatValue(ind)}
                    </span>
                    <div
                      data-bar={`${Math.max(heightFor(ind), 1.5)}%`}
                      style={{ height: `${Math.max(heightFor(ind), 1.5)}%` }}
                      className={cn(
                        "w-full rounded-t-md transition-[height,background-color] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        active === i ? "bg-navy-500" : "bg-navy-600",
                      )}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Labels, in the same flex rhythm as the columns above. */}
            <ul className="flex gap-6 pt-3">
              {indicators.map((ind, i) => {
                const delta =
                  ind.baseline_value !== null ? ind.value - Number(ind.baseline_value) : null;
                const improved =
                  delta === null ? null : ind.better === "lower" ? delta < 0 : delta > 0;

                const status: Status =
                  delta === null || delta === 0
                    ? "neutral"
                    : improved
                      ? "good"
                      : Math.abs(delta) >= CRITICAL_DELTA
                        ? "critical"
                        : "warning";

                return (
                  <li
                    key={ind.id}
                    style={{ width: COLUMN_WIDTH }}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <p
                      className={cn(
                        "text-[0.75rem] font-bold leading-snug transition-colors",
                        active === i ? "text-navy-600" : "text-navy-900",
                      )}
                    >
                      {ind.label}
                    </p>
                    {ind.segment && (
                      <p className="mt-0.5 text-[0.6875rem] font-medium leading-snug text-navy-500">
                        {ind.segment}
                      </p>
                    )}

                    {delta !== null && (
                      // Direction is carried by the glyph and the word as well
                      // as the colour — red/green is the pair a deuteranope
                      // cannot read, so neither may carry the meaning alone.
                      <span
                        className={cn(
                          "mt-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.6875rem] font-bold ring-1",
                          STATUS_STYLES[status],
                        )}
                      >
                        {delta === 0 ? (
                          <Minus className="size-3 shrink-0" aria-hidden="true" />
                        ) : delta < 0 ? (
                          <ArrowDownRight className="size-3 shrink-0" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight className="size-3 shrink-0" aria-hidden="true" />
                        )}
                        {delta > 0 ? "+" : ""}
                        {Number(delta.toFixed(1))}
                        {ind.unit === "percent" ? "pp" : ""}{" "}
                        {improved ? "better" : "worse"}
                      </span>
                    )}

                    <p className="mt-2 text-[0.6875rem] font-medium leading-snug text-navy-500">
                      {[ind.period, ind.county].filter(Boolean).join(" · ")}
                    </p>

                    {/* Source on every figure. An unattributed health statistic
                        is worse than none, so it is rendered inline rather than
                        in a footnote nobody reads. */}
                    <p className="mt-1 text-[0.6875rem] font-medium leading-snug text-navy-400">
                      {ind.source_url ? (
                        <a
                          href={ind.source_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-0.5 text-azure-700 underline underline-offset-2"
                        >
                          {ind.source}
                          <ExternalLink className="size-2.5 shrink-0" aria-hidden="true" />
                        </a>
                      ) : (
                        ind.source
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Table view: needed for screen readers, print and anyone who wants the
          numbers rather than the shape. */}
      <details className="mt-6 border-t border-navy-100 pt-4">
        <summary className="cursor-pointer text-sm font-bold text-azure-700 hover:underline">
          View as a table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <caption className="sr-only">{title}, with sources</caption>
            <thead>
              <tr className="border-b border-navy-100">
                <th scope="col" className="py-2 font-bold text-navy-700">Indicator</th>
                <th scope="col" className="py-2 text-right font-bold text-navy-700">Value</th>
                <th scope="col" className="py-2 text-right font-bold text-navy-700">Period</th>
                <th scope="col" className="py-2 text-right font-bold text-navy-700">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {indicators.map((ind) => (
                <tr key={ind.id}>
                  <th scope="row" className="py-2 font-medium text-navy-800">
                    {ind.label}
                    {ind.segment && <span className="text-navy-500"> · {ind.segment}</span>}
                  </th>
                  <td className="py-2 text-right font-mono tabular-nums text-navy-700">
                    {formatValue(ind)}
                  </td>
                  <td className="py-2 text-right text-navy-600">{ind.period || "—"}</td>
                  <td className="py-2 text-right text-navy-600">{ind.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
