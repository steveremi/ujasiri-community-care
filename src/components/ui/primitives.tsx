import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  lead,
  align = "left",
  invert = false,
  action,
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  invert?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start",
        action && "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <h2
          className={cn(
            "mt-3 text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl",
            invert ? "text-white" : "text-navy-950",
          )}
        >
          {title}
        </h2>
        {lead && (
          <p
            className={cn(
              "mt-4 text-lg leading-relaxed",
              invert ? "text-white/75" : "text-navy-600",
            )}
          >
            {lead}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Section({
  children,
  className,
  tone = "white",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "white" | "navy" | "tint" | "deep";
  id?: string;
}) {
  const tones = {
    white: "bg-white",
    navy: "bg-navy-950 text-white",
    tint: "bg-navy-50/60",
    deep: "bg-navy-900 text-white",
  } as const;

  return (
    <section id={id} className={cn("py-20 sm:py-24", tones[tone], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "azure" | "navy" | "amber" | "green" | "red";
  className?: string;
}) {
  const tones = {
    neutral: "bg-navy-50 text-navy-700 ring-navy-100",
    azure: "bg-azure-50 text-azure-800 ring-azure-200",
    navy: "bg-navy-900 text-white ring-navy-900",
    amber: "bg-amber-50 text-amber-800 ring-amber-100",
    green: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  as: As = "div",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
  hover?: boolean;
}) {
  return (
    <As
      className={cn(
        "overflow-hidden rounded-card border border-navy-100 bg-white shadow-card",
        hover && "transition-shadow duration-200 hover:shadow-lift",
        className,
      )}
    >
      {children}
    </As>
  );
}

/** A quiet inline link with a moving arrow. */
export function ArrowLink({
  href,
  children,
  className,
  invert = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  invert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold underline-offset-4 hover:underline",
        invert ? "text-azure-300" : "text-azure-700",
        className,
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-navy-200 bg-navy-50/40 px-6 py-16 text-center",
        className,
      )}
    >
      <h3 className="text-xl font-extrabold text-navy-900">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-navy-600">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
