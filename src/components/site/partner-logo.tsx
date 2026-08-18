import type { Partner } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A partner's mark.
 *
 * Where the partner has supplied a logo file we render it. Where they have not,
 * we render a monogram built from their own initials — never an approximation
 * of their real logo.
 *
 * That restraint is the point of this page. We publish referral partners so a
 * community can check that the door we send them to is real; a coat of arms
 * drawn from memory would defeat exactly that, and in the case of the Ministry
 * of Health or a county government it would be a forged official emblem. A
 * monogram claims nothing it cannot back up.
 *
 * To swap in a real logo, drop the file into `public/partners/` and set
 * `logo_url` on the partner record — no code change. `public/partners/README.md`
 * lists the filename each partner expects and where the official asset comes
 * from.
 */

/** Words that carry no identity, so they earn no letter in the monogram. */
const NOISE = new Set(["of", "the", "and", "for", "a", "an", "de", "&"]);

/**
 * "Ministry of Health" → MH, "National TB Programme" → NTP.
 *
 * Organisations are known by acronyms rather than by first-and-last initial,
 * which is why this does not reuse `initials()` from lib/utils — that one is
 * built for people's names and would give "Ministry of Health" back as "MO".
 */
export function monogram(name: string): string {
  const letters = name
    .split(/[\s\-–—]+/)
    .filter((word) => word && !NOISE.has(word.toLowerCase()))
    .map((word) => word[0])
    .filter((char) => /[a-z0-9]/i.test(char));

  const mark = letters.slice(0, 4).join("").toUpperCase();
  // Falls back to the name itself for anything unsplittable (e.g. a CJK name).
  return mark || name.trim().slice(0, 2).toUpperCase();
}

/**
 * Tier decides the tone, so the wall reads as three groups at a glance without
 * needing to re-read the headings. Kept inside the muted end of the palette:
 * these are other people's identities and should not outshout our own.
 */
const tones: Record<Partner["tier"], string> = {
  implementing: "bg-navy-50 text-navy-800 ring-navy-100",
  partner: "bg-azure-50 text-azure-800 ring-azure-100",
  funder: "bg-navy-100 text-navy-900 ring-navy-200",
};

/** Longer monograms need to step down a size to stay inside the square. */
function markTextSize(mark: string): string {
  if (mark.length >= 4) return "text-[0.6875rem] tracking-tight";
  if (mark.length === 3) return "text-[0.8125rem] tracking-tight";
  return "text-sm";
}

export function PartnerMark({
  partner,
  className,
  size = "md",
}: {
  partner: Partner;
  className?: string;
  /** `md` for cards, `sm` for the dense homepage wall. */
  size?: "sm" | "md";
}) {
  const box = cn(
    "grid shrink-0 place-items-center overflow-hidden rounded-xl",
    size === "sm" ? "size-10" : "size-12",
    className,
  );

  if (partner.logo_url) {
    return (
      <div className={cn(box, "bg-white ring-1 ring-navy-100")}>
        {/* Partner logos arrive at whatever dimensions the partner supplies, so
            they are contained rather than cropped, and left unoptimised — a
            logo is already small, and next/image would need a known size. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={partner.logo_url}
          alt={`${partner.name} logo`}
          className="size-full object-contain p-1.5"
          loading="lazy"
        />
      </div>
    );
  }

  const mark = monogram(partner.name);

  return (
    <div
      className={cn(box, "font-extrabold ring-1", tones[partner.tier], markTextSize(mark))}
      // The name is always rendered next to this, so the mark is decoration.
      aria-hidden="true"
    >
      {mark}
    </div>
  );
}
