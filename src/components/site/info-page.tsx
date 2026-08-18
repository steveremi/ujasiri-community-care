import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, Phone } from "lucide-react";

import { ImageRotator } from "@/components/media/image-rotator";
import { AfterHoursLines } from "@/components/site/after-hours-lines";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/lib/site";

/**
 * Shared renderer for prose-led pages (policies, guidance, "what to do"
 * pages). Keeps them structurally identical so a visitor learns the shape
 * once, and keeps each page file down to its actual content.
 */

export interface InfoSection {
  heading: string;
  /** Paragraphs. A string starting with "- " renders as a list item. */
  body: string[];
}

export function InfoPage({
  title,
  lead,
  breadcrumbs,
  sections,
  urgent,
  callout,
  children,
  images,
  imageSeed = 0,
  sidebar = "support",
  sectionImages,
  layout = "prose",
}: {
  title: string;
  lead?: string;
  breadcrumbs: { name: string; href: string }[];
  sections: InfoSection[];
  /** Time-critical safety information, shown before anything else. */
  urgent?: string;
  callout?: ReactNode;
  children?: ReactNode;
  /**
   * Rotating photographs behind the heading. Opt-in: twelve pages share this
   * component and most of them — privacy, terms, accessibility — are better
   * plain. Pass a reserved subset from lib/gallery, never the whole pool.
   */
  images?: string[];
  imageSeed?: number;
  /**
   * The support rail. Default on, because most pages using this component are
   * health guidance where "find services near you" is the next step.
   *
   * Set to "none" where it would be off-topic — the complaints page is the
   * case: somebody reporting misconduct is not looking for a clinic, and a
   * hotline card beside the escalation route competes with the one instruction
   * that matters.
   */
  sidebar?: "support" | "none";
  /**
   * Photographs threaded between the sections, to break up a long read.
   *
   * One band after every second section rather than one per section: a picture
   * between every heading turns the page into a gallery with captions, and this
   * is a page somebody reads to find out what to do.
   */
  sectionImages?: string[];
  /**
   * `prose` is the default and right for policy text — privacy, terms — which
   * is read start to finish.
   *
   * `cards` suits a page read by jumping to the one answer you came for. Each
   * section becomes its own numbered surface, matching the cards on the impact
   * and transparency pages, and a photograph sits between each pair so a long
   * page of instructions does not read as a wall.
   */
  layout?: "prose" | "cards";
}) {
  return (
    <>
      <PageHero
        title={title}
        lead={lead}
        breadcrumbs={breadcrumbs}
        images={images}
        imageSeed={imageSeed}
      />

      {urgent && (
        <section className="border-b-2 border-azure-300 bg-azure-100">
          <div className="container-page py-7">
            <div className="flex gap-4">
              <AlertTriangle
                className="mt-0.5 size-6 shrink-0 text-azure-800"
                aria-hidden="true"
              />
              <div>
                <p className="text-lg font-extrabold leading-snug text-navy-950">{urgent}</p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {site.help.lines.map((line, i) => (
                    <a
                      key={line.number}
                      href={`tel:${line.number.replace(/\s/g, "")}`}
                      className={
                        i === 0
                          ? "inline-flex h-10 items-center gap-2 rounded-full bg-navy-900 px-4 text-sm font-bold text-white hover:bg-navy-800"
                          : "inline-flex h-10 items-center gap-2 rounded-full border-2 border-navy-300 px-4 text-sm font-bold text-navy-900 hover:bg-white"
                      }
                    >
                      <Phone className="size-4" aria-hidden="true" />
                      {line.number}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div
        className={
          sidebar === "none"
            ? "container-page py-14 lg:py-20"
            : "container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16 lg:py-20"
        }
      >
        <div className={sidebar === "none" ? "mx-auto max-w-3xl" : "max-w-none"}>
          {sections.map((section, index) => {
            // A band after every second section, never after the last one —
            // the reader should finish on the text, not on a photograph.
            const hasImages = Boolean(sectionImages && sectionImages.length > 0);
            // Cards carry a photograph between every pair; prose gets one after
            // every second section, so the reading is not constantly broken.
            const band =
              hasImages &&
              index !== sections.length - 1 &&
              (layout === "cards" || index % 2 === 1);

            return (
            <div key={section.heading} className={layout === "cards" && index > 0 ? "mt-6" : undefined}>
            <Reveal delay={Math.min(index, 4) * 90}>
            <section
              // Cards: each answer on its own surface, numbered, so the page
              // can be scanned for the one thing the reader came for.
              // Prose: a rule between sections rather than margin alone, or the
              // headings run together on a page this text-heavy.
              className={
                layout === "cards"
                  ? "group rounded-card border-2 border-navy-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift sm:p-9"
                  : index === 0
                    ? "prose-ucc"
                    : "prose-ucc mt-12 border-t border-navy-100 pt-10"
              }
            >
              {layout === "cards" && (
                <span className="mb-5 grid size-10 place-items-center rounded-xl bg-azure-50 font-mono text-sm font-extrabold text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <div className={layout === "cards" ? "prose-ucc" : undefined}>
              <h2 className="!mt-0">{section.heading}</h2>
              {(() => {
                const out: ReactNode[] = [];
                let list: string[] = [];

                const flush = (key: string) => {
                  if (list.length) {
                    out.push(
                      <ul key={`ul-${key}`}>
                        {list.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>,
                    );
                    list = [];
                  }
                };

                section.body.forEach((block, i) => {
                  if (block.startsWith("- ")) {
                    list.push(block.slice(2));
                  } else {
                    flush(String(i));
                    out.push(<p key={i}>{block}</p>);
                  }
                });
                flush("end");
                return out;
              })()}
              </div>
            </section>
            </Reveal>

            {band && (
              <Reveal delay={120} className="mt-6">
                <ImageRotator
                  images={sectionImages!}
                  alt=""
                  offset={index}
                  interval={6000 + index * 400}
                  overlay
                  className="aspect-16/9 w-full rounded-card shadow-card sm:aspect-21/9"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                />
              </Reveal>
            )}
            </div>
            );
          })}
          {children}
        </div>

        {sidebar === "support" && (
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Reveal from="right">
          {callout ?? (
            <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-6">
              <h2 className="text-lg font-extrabold text-navy-950">Talk to someone</h2>
              <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                Our services are free and confidential. Nothing is shared with your family,
                partner or employer.
              </p>
              <ButtonLink href="/get-help" size="md" className="mt-5 w-full">
                Find services near you
              </ButtonLink>
              <ButtonLink href="/contact" size="md" variant="outline" className="mt-2.5 w-full">
                Contact us
              </ButtonLink>
            </div>
          )}
          </Reveal>

          <Reveal from="right" delay={110}>
            <AfterHoursLines />
          </Reveal>

          <div className="rounded-card border-2 border-navy-100 p-6">
            <h2 className="text-base font-extrabold text-navy-950">Our hotline</h2>
            <ul className="mt-4 space-y-3">
              {site.help.lines.map((line) => (
                <li key={line.label}>
                  <a
                    href={`tel:${line.number.replace(/\s/g, "")}`}
                    className="group flex items-baseline justify-between gap-3"
                  >
                    <span className="text-sm font-semibold text-navy-600">{line.label}</span>
                    <span className="shrink-0 font-mono text-sm font-bold text-azure-700 group-hover:underline">
                      {line.number}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm font-medium text-navy-600">
            <Link
              href="/get-help"
              className="font-bold text-azure-700 underline underline-offset-4"
            >
              ← All support services
            </Link>
          </p>
        </aside>
        )}
      </div>
    </>
  );
}
