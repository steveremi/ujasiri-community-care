import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "white";
type Size = "sm" | "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-2 font-bold rounded-full " +
  "transition-[background-color,color,box-shadow,transform] duration-150 " +
  "active:translate-y-px disabled:opacity-50 disabled:pointer-events-none " +
  "whitespace-nowrap tracking-tight";

const variants: Record<Variant, string> = {
  // Azure on white and white on navy both clear WCAG AA at these weights.
  primary: "bg-azure-600 text-white hover:bg-azure-700 shadow-sm hover:shadow-glow",
  secondary: "bg-navy-900 text-white hover:bg-navy-800 shadow-sm hover:shadow-lift",
  outline:
    "border-2 border-navy-200 text-navy-900 bg-white hover:border-azure-400 hover:bg-azure-50",
  ghost: "text-navy-800 hover:bg-azure-50 hover:text-navy-950",
  danger: "bg-red-600 text-white hover:bg-red-700",
  // For use on navy surfaces where an outline would disappear.
  white: "bg-white text-navy-900 hover:bg-azure-50 shadow-sm",
};

// Standard control sizes. `md` is the default and matches the height of a
// normal form input, so buttons sit level with fields instead of towering
// over them.
const sizes: Record<Size, string> = {
  sm: "text-[0.8125rem] px-3.5 h-8",
  md: "text-sm px-4 h-10",
  lg: "text-[0.9375rem] px-5 h-11",
  xl: "text-[0.9375rem] px-6 h-12",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}
