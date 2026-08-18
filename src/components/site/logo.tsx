import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The UCC mark: a shield (protection, confidentiality) whose interior forms
 * two figures — one steadying the other. Drawn inline rather than loaded as a
 * file so it inherits colour, scales without a second request, and never
 * flashes on first paint.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={cn("size-9", className)}>
      <path
        d="M20 2.5 5.5 8v13.2c0 7.6 5.9 14 14.5 16.3 8.6-2.3 14.5-8.7 14.5-16.3V8L20 2.5Z"
        className="fill-navy-900"
      />
      <path
        d="M20 6.2 9 10.3v10.9c0 5.9 4.5 10.9 11 12.9 6.5-2 11-7 11-12.9V10.3L20 6.2Z"
        className="fill-azure-400"
        opacity={0.25}
      />
      {/* Two figures, the taller steadying the smaller. */}
      <circle cx="16.2" cy="15.4" r="3" className="fill-white" />
      <path d="M10.6 28.4c0-3.4 2.5-6 5.6-6s5.6 2.6 5.6 6v.8h-11.2v-.8Z" className="fill-white" />
      <circle cx="25.4" cy="18.2" r="2.3" className="fill-azure-300" />
      <path
        d="M21.2 28.4c0-2.7 1.9-4.7 4.2-4.7s4.2 2 4.2 4.7v.8h-8.4v-.8Z"
        className="fill-azure-300"
      />
    </svg>
  );
}

const sizes = {
  md: { mark: "size-10", name: "text-2xl tracking-[0.02em]", sub: "text-[0.5625rem]" },
  lg: { mark: "size-14", name: "text-3xl sm:text-4xl tracking-[0.02em]", sub: "text-[0.625rem]" },
} as const;

export function Logo({
  className,
  showWordmark = true,
  invert = false,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  invert?: boolean;
  size?: keyof typeof sizes;
}) {
  const s = sizes[size];

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label="Ujasiri Community Care — home"
    >
      <LogoMark
        className={cn(
          s.mark,
          "shrink-0 transition-transform duration-200 group-hover:scale-105",
          invert && "[&_.fill-navy-900]:fill-white",
        )}
      />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn("font-black", s.name, invert ? "text-white" : "text-navy-900")}
          >
            UCC
          </span>
          {/* The initials carry the brand; the full name sits underneath so a
              first-time visitor still learns what UCC stands for. */}
          <span
            className={cn(
              "mt-1 font-bold uppercase tracking-[0.08em]",
              s.sub,
              invert ? "text-azure-300" : "text-azure-700",
            )}
          >
            (Ujasiri Community Care)
          </span>
        </span>
      )}
    </Link>
  );
}
