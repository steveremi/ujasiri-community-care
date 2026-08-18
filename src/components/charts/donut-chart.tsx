"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

import { cn, formatMoney, formatNumber } from "@/lib/utils";

/**
 * Pie / donut — part-to-whole, and only part-to-whole.
 *
 * Use this ONLY where the slices genuinely partition one total. Do not use it
 * for reach by programme: those figures overlap by design, so the parts do not
 * sum to a whole and a pie would assert something false. Columns are the right
 * form there — see `CategoryBars`.
 *
 * Colour. Four brand-adjacent hues, run through the palette validator and
 * passing the lightness band, the chroma floor, adjacent-pair CVD separation
 * (worst pair ΔE 13.0 protan) and the normal-vision floor:
 *
 *     #1f47e0  navy
 *     #059669  green
 *     #f59e0b  amber
 *     #dc2626  red
 *
 * An all-blue set was tried first and could not separate four slices. These
 * hues can, which is why they are here.
 *
 * One caution for whoever edits this next: green, amber and red also carry
 * status meaning in `IndicatorChart`, where they mark movement against a
 * baseline. Here they are pure category labels — an amber slice is not a
 * warning about that category.
 *
 * The amber step carries a contrast warning against white, which obliges
 * visible labels and a table view rather than colour alone. Both ship below.
 *
 * FOUR IS THE CEILING — a fifth category folds into "Other".
 */

const SLICE_COLORS = ["#1f47e0", "#059669", "#f59e0b", "#dc2626"] as const;
const MAX_SLICES = SLICE_COLORS.length;

export interface DonutSlice {
  label: string;
  value: number;
  /** Rendered under the label in the legend. */
  note?: string;
}

/**
 * How values are rendered.
 *
 * A name rather than a formatter function, because this is a Client Component
 * and a Server Component cannot pass a function across the boundary.
 */
export type ValueFormat = "money" | "number";

const FORMATTERS: Record<ValueFormat, (n: number) => string> = {
  money: (cents) => formatMoney(cents, "KES", { compact: true }),
  number: (n) => formatNumber(n),
};

/**
 * Geometry per variant.
 *
 * Both are drawn the same way — one stroked circle per slice, positioned with
 * `stroke-dashoffset`. A filled pie is the ring taken to its limit: a circle of
 * radius R/2 stroked at width R covers every radius from the centre out to R,
 * so one code path renders both and the animation is identical.
 */
const GEOM = {
  donut: { radius: 70, stroke: 26 },
  // Held slightly under the half-viewBox so the stroke growth on hover still
  // fits inside the box instead of clipping.
  pie: { radius: 46, stroke: 92 },
} as const;

/** Surface-coloured gap between neighbouring slices, in user units. */
const GAP = 3;

export function DonutChart({
  title,
  slices,
  /** How to render each value. See `ValueFormat`. */
  format = "number",
  /** Shown under the centred total. */
  totalLabel = "total",
  /** Column heading for the value in the table view. */
  valueLabel = "Value",
  /**
   * `donut` keeps a hole, which buys a place to put the total and the hovered
   * slice's share. `pie` fills the disc; the total then sits above the legend,
   * because a label in the middle of a filled pie collides with the slices.
   */
  variant = "donut",
  className,
}: {
  title: string;
  slices: DonutSlice[];
  format?: ValueFormat;
  totalLabel?: string;
  valueLabel?: string;
  variant?: "donut" | "pie";
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<number | null>(null);
  /** Labels the reader has switched off. Filtering is per-category. */
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  const fmt = FORMATTERS[format];

  const { radius: RADIUS, stroke: STROKE } = GEOM[variant];
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  /**
   * Slices sweep in when the figure scrolls into view.
   *
   * Only the entrance is driven from here. The dash geometry itself lives in
   * the `style` prop so React owns it — an earlier version wrote it to
   * `element.style` imperatively, which then outranked React's own updates and
   * froze the chart the moment a category was filtered out.
   */
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const arcs = Array.from(node.querySelectorAll<SVGCircleElement>("[data-arc]"));
    if (arcs.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    for (const arc of arcs) arc.style.strokeDasharray = `0 ${CIRCUMFERENCE}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Hand control back to React, which re-applies the real geometry from
        // the style prop on the next paint.
        for (const arc of arcs) arc.style.removeProperty("stroke-dasharray");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [CIRCUMFERENCE]);

  const present = slices.filter((s) => s.value > 0);

  // Beyond four slices the palette runs out, so the tail is folded into a
  // single "Other" rather than cycling a hue back round — two slices sharing a
  // colour is worse than one honest bucket. The fold happens BEFORE filtering,
  // so switching a category off never re-folds the rest under the reader.
  const ranked = [...present].sort((a, b) => b.value - a.value);
  const folded =
    ranked.length <= MAX_SLICES
      ? ranked
      : [
          ...ranked.slice(0, MAX_SLICES - 1),
          {
            label: "Other",
            value: ranked.slice(MAX_SLICES - 1).reduce((sum, s) => sum + s.value, 0),
            note: `${ranked.length - (MAX_SLICES - 1)} smaller categories, combined.`,
          },
        ];

  // Colour is bound to the category here, once, on the unfiltered order — so
  // switching one off never repaints the survivors. A reader who has learned
  // that green means Adolescents must not have it mean something else after a
  // click.
  const withColor = folded.map((slice, i) => ({
    ...slice,
    color: SLICE_COLORS[i % SLICE_COLORS.length],
  }));

  const visible = withColor.filter((s) => !hidden.has(s.label));
  const total = visible.reduce((sum, s) => sum + s.value, 0);

  const toggle = (label: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      // Never let the reader empty the chart entirely — the last visible
      // category stays on, because an empty pie is a bug, not a filter state.
      else if (visible.length > 1) next.add(label);
      return next;
    });

  if (withColor.length === 0) return null;

  // Each arc starts where the previous one ended. A prefix sum over the
  // preceding VISIBLE slices, so the ring stays closed as categories drop out.
  const geometry = visible.map((slice, i) => {
    const fraction = total > 0 ? slice.value / total : 0;
    const length = fraction * CIRCUMFERENCE;
    const gap = visible.length === 1 ? 0 : GAP;
    const drawn = Math.max(length - gap, 0.5);
    const offset =
      total > 0
        ? (visible.slice(0, i).reduce((sum, s) => sum + s.value, 0) / total) * CIRCUMFERENCE
        : 0;

    return {
      ...slice,
      dash: `${drawn} ${CIRCUMFERENCE - drawn}`,
      offset,
      percent: Math.round(fraction * 100),
    };
  });

  const shown = active !== null ? geometry[active] : null;
  const filtered = hidden.size > 0;

  return (
    <figure
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

      <div className="mt-7 grid items-center gap-8 sm:grid-cols-[auto_1fr]">
        <div className="relative mx-auto size-52">
          <svg
            ref={ref}
            viewBox="0 0 200 200"
            className="size-full -rotate-90"
            role="img"
            aria-label={`${title}. ${geometry
              .map((g) => `${g.label}: ${g.percent}%`)
              .join(", ")}.`}
          >
            {geometry.map((g, i) => (
              <circle
                key={g.label}
                data-arc=""
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke={g.color}
                strokeWidth={active === i ? STROKE + 6 : STROKE}
                style={{ strokeDasharray: g.dash, strokeDashoffset: -g.offset }}
                className="cursor-pointer transition-[stroke-dasharray,stroke-dashoffset,stroke-width] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
            ))}
          </svg>

          {/* Centre reads the hovered slice, or the total at rest. Donut only —
              on a filled pie this would sit on top of the slices. Text wears
              ink tokens, never the slice colour. */}
          {variant === "donut" && (
            <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <p className="text-2xl font-extrabold tracking-tight text-navy-950">
                {shown ? `${shown.percent}%` : fmt(total)}
              </p>
              <p className="mt-1 max-w-[7.5rem] text-[0.6875rem] font-bold uppercase leading-tight tracking-wider text-navy-500">
                {shown ? shown.label : totalLabel}
              </p>
            </div>
          )}
        </div>

        {/* Legend, and the filter control. Every category is directly labelled
            with its value, so identity and magnitude both survive without
            colour. Clicking one switches it out of the total. */}
        <div>
          {variant === "pie" && (
            <p className="mb-4 border-b border-navy-100 pb-3">
              <span className="font-mono text-xl font-extrabold tabular-nums text-navy-950">
                {fmt(total)}
              </span>{" "}
              <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-navy-500">
                {totalLabel}
                {filtered && " shown"}
              </span>
            </p>
          )}

          <ul className="space-y-1.5">
            {withColor.map((slice) => {
              const off = hidden.has(slice.label);
              const geo = geometry.find((g) => g.label === slice.label);
              const i = geometry.findIndex((g) => g.label === slice.label);

              return (
                <li key={slice.label}>
                  <button
                    type="button"
                    onClick={() => toggle(slice.label)}
                    onMouseEnter={() => !off && setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    aria-pressed={!off}
                    className={cn(
                      "flex w-full gap-3 rounded-lg p-2 text-left transition-colors",
                      active === i && !off ? "bg-azure-50" : "hover:bg-navy-50",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1 size-3 shrink-0 rounded-sm ring-1 ring-inset ring-black/10 transition-opacity",
                        off && "opacity-25",
                      )}
                      style={{ background: slice.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span
                          className={cn(
                            "text-[0.9375rem] font-bold transition-colors",
                            off ? "text-navy-400 line-through" : "text-navy-900",
                          )}
                        >
                          {slice.label}
                        </span>
                        <span
                          className={cn(
                            "font-mono text-sm font-extrabold tabular-nums",
                            off ? "text-navy-300" : "text-navy-950",
                          )}
                        >
                          {off ? "hidden" : `${geo?.percent ?? 0}%`}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block font-mono text-[0.8125rem] tabular-nums",
                          off ? "text-navy-300" : "text-navy-600",
                        )}
                      >
                        {fmt(slice.value)}
                      </span>
                      {slice.note && !off && (
                        <span className="mt-1 block text-[0.8125rem] font-medium leading-relaxed text-navy-500">
                          {slice.note}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-3 px-2 text-[0.6875rem] font-medium text-navy-400">
            Select a category to remove it from the total.
          </p>
        </div>
      </div>

      {/* Required, not optional: the amber step carries a sub-3:1 contrast
          warning against white, and the numbers should be readable without the
          shape anyway — in print, in forced colours, and by screen reader. The
          table always shows every category, filtered or not. */}
      <details className="mt-6 border-t border-navy-100 pt-4">
        <summary className="cursor-pointer text-sm font-bold text-azure-700 hover:underline">
          View as a table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[24rem] text-left text-sm">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b border-navy-100">
                <th scope="col" className="py-2 font-bold text-navy-700">Category</th>
                <th scope="col" className="py-2 text-right font-bold text-navy-700">
                  {valueLabel}
                </th>
                <th scope="col" className="py-2 text-right font-bold text-navy-700">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {withColor.map((slice) => {
                const fullTotal = withColor.reduce((sum, s) => sum + s.value, 0);
                return (
                  <tr key={slice.label}>
                    <th scope="row" className="py-2 font-medium text-navy-800">
                      {slice.label}
                    </th>
                    <td className="py-2 text-right font-mono tabular-nums text-navy-700">
                      {fmt(slice.value)}
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums text-navy-700">
                      {Math.round((slice.value / fullTotal) * 100)}%
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-navy-100">
                <th scope="row" className="py-2 font-bold text-navy-900">Total</th>
                <td className="py-2 text-right font-mono font-bold tabular-nums text-navy-900">
                  {fmt(withColor.reduce((sum, s) => sum + s.value, 0))}
                </td>
                <td className="py-2 text-right font-mono font-bold tabular-nums text-navy-900">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
