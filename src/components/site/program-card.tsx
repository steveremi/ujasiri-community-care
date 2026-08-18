import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Baby,
  HeartHandshake,
  HeartPulse,
  Ribbon,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
} from "lucide-react";

import { ImageRotator } from "@/components/media/image-rotator";
import { MediaSlot } from "@/components/media/media-slot";
import { CARDS, deal } from "@/lib/gallery";
import type { Program } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

const icons = {
  Ribbon,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Baby,
  Target,
  Accessibility,
} as const;

/**
 * Programme card.
 *
 * The icon badge sits on the photograph rather than above the text, which ties
 * the two halves of the card together and keeps the body copy on one
 * uninterrupted vertical rhythm.
 *
 * The whole card is a single link — a stretched pseudo-element over the title —
 * rather than a card containing a separate "read more" anchor. That gives one
 * large target on touch and one tab stop instead of two, without nesting
 * interactive elements inside each other.
 */
export function ProgramCard({
  program,
  showImage = true,
}: {
  program: Program;
  showImage?: boolean;
}) {
  const Icon = icons[program.icon as keyof typeof icons] ?? HeartHandshake;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border-2 border-navy-100 bg-white",
        "shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300",
        "hover:shadow-lift focus-within:border-azure-400",
      )}
    >
      {showImage && (
        <div className="relative overflow-hidden">
          {program.cover_image ? (
            <MediaSlot
              src={program.cover_image}
              alt={program.title}
              ratio="wide"
              rounded={false}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              imageClassName="transition-transform duration-[900ms] ease-out group-hover:scale-105"
            />
          ) : (
            <ImageRotator
              images={deal(program.sort_order, 0, 5, CARDS)}
              alt={program.title}
              offset={program.sort_order}
              className="aspect-16/10"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          )}

          {/* Gradient foot so the badge reads against any photograph. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-950/75 to-transparent"
          />

          <span
            className={cn(
              "absolute bottom-4 left-4 grid size-11 place-items-center rounded-xl shadow-lg",
              "transition-transform duration-300 group-hover:scale-110",
              program.accent === "navy"
                ? "bg-navy-900 text-azure-300"
                : "bg-azure-500 text-navy-950",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-extrabold leading-snug tracking-tight text-navy-950">
          <Link
            href={`/programs/${program.slug}`}
            className="after:absolute after:inset-0 group-hover:text-azure-800"
          >
            {program.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
          {program.summary}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-navy-100 pt-4">
          {/* Zero means no figure has been recorded yet, so nothing is claimed.
              The number is entered in the admin by someone holding
              content:edit — never hardcoded. */}
          {program.people_reached > 0 ? (
            <span className="text-sm text-navy-500">
              <span className="text-base font-extrabold text-navy-950">
                {formatNumber(program.people_reached)}
              </span>{" "}
              <span className="font-semibold">reached</span>
            </span>
          ) : (
            <span className="text-sm font-semibold text-navy-500">Read the programme</span>
          )}

          <span
            aria-hidden="true"
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full transition-all duration-300",
              "bg-navy-50 text-navy-600 group-hover:bg-azure-500 group-hover:text-white",
            )}
          >
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
