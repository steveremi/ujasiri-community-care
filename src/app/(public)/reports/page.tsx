import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, Mail, ScrollText, ShieldCheck } from "lucide-react";

import { ImageRotator } from "@/components/media/image-rotator";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { REPORTS, split } from "@/lib/gallery";
import { listIndicatorsByCategory } from "@/lib/repos/indicators";
import { getSettings } from "@/lib/repos/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Annual reports",
  description:
    "Independently audited annual reports from Ujasiri Community Care — financial statements, the auditor's letter, programme results, and a published section on what did not work.",
  alternates: { canonical: "/reports" },
};

/**
 * Annual reports.
 *
 * No financial figures appear unless real audited lines have been entered from
 * the admin. Publishing an invented total on the page that exists to prove
 * financial integrity would defeat the page.
 *
 * Reports are offered as documents to download or request rather than
 * summarised inline. A summary written for a website is not the same artefact
 * as a signed set of accounts, and conflating the two is how organisations end
 * up quoting figures nobody can trace back to an audit.
 */
export default async function ReportsPage() {
  const [groups, site] = await Promise.all([listIndicatorsByCategory(), getSettings()]);

  // Years available for download. Derived from published indicators rather
  // than from spending, which is not public.
  const years = [
    ...new Set(groups.flatMap((g) => g.items.map((i) => i.year)).filter(Boolean)),
  ].sort((a, b) => (b as number) - (a as number)) as number[];

  const contents = [
    {
      Icon: FileText,
      title: "Audited financial statements",
      body: "The full accounts as signed off. Shared with our board, our regulator and our funders, and available to anyone who asks.",
    },
    {
      Icon: ShieldCheck,
      title: "The auditor's letter",
      body: "Including the management letter, where the auditor says what they actually found.",
    },
    {
      Icon: ScrollText,
      title: "The trustees' report",
      body: "How the board governed, what it decided, and what it is worried about.",
    },
    {
      Icon: Download,
      title: "Programme results",
      body: "Measured against what we said we would do at the start of the year — not against what we managed.",
    },
  ];

  return (
    <>
      <PageHero
        title="Annual reports"
        lead="Independently audited, published in full, and containing a section on our failures that our board argues about every single year."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Annual reports", href: "/reports" },
        ]}
        images={split(REPORTS, 0, 3)}
        imageSeed={1}
      />

      {/* ------------------------------------------------------- What is in --- */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div>
            <SectionHeading
              title="What is in them"
              lead="Four documents, published together. Nothing is held back for a shorter version."
            />

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {contents.map((item, i) => (
                <Reveal key={item.title} delay={(i % 2) * 90}>
                  <div className="group h-full rounded-card border-2 border-navy-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                    <span className="grid size-10 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                      <item.Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-extrabold leading-snug text-navy-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.8125rem] font-medium leading-relaxed text-navy-600">
                      {item.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-8 rounded-card border-2 border-azure-200 bg-azure-50/60 p-6">
              <h3 className="text-lg font-extrabold text-navy-950">
                And a section titled &ldquo;What did not work&rdquo;
              </h3>
              <p className="mt-2.5 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                It is the section people notice, and the one our board argues about. We keep it
                because a report without failures is not evidence of a flawless year — it is
                evidence of a document written for donors rather than for the communities we
                serve.
              </p>
            </div>
          </div>

          <ImageRotator
            images={split(REPORTS, 1, 3)}
            alt="Ujasiri Community Care teams and the communities we report to"
            offset={2}
            className="aspect-4/5 rounded-card shadow-card lg:sticky lg:top-28"
            sizes="(min-width: 1024px) 32vw, 100vw"
          />
        </div>
      </Section>

      {/* Full-width band, breaking the page before the figures. */}
      <section className="border-y border-navy-100">
        <ImageRotator
          images={split(REPORTS, 2, 3)}
          alt="A community review meeting, where the accounts are presented in person"
          offset={4}
          interval={6200}
          overlay
          className="h-72 w-full sm:h-88 lg:h-[26rem]"
          sizes="100vw"
        />
      </section>

      {/* ---------------------------------------------------------- Figures --- */}
      <Section tone="tint">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div>
            <SectionHeading
              title="What the numbers say"
              lead="The state of the epidemic where we work, and whether our programmes are moving it. Every figure carries its source, because an unattributed health statistic is worse than none."
            />

            {/* The national indicators are charted on /impact, in a single
                figure on one shared axis. Drawing the same six figures again
                here made the two pages look like the same page — and split
                across four category cards they could not be compared anyway,
                which is the only reason to chart them. Link, do not repeat. */}
            {groups.length > 0 ? (
              <div className="mt-10 rounded-card border-2 border-navy-100 bg-white p-7 shadow-card">
                <h3 className="text-lg font-extrabold text-navy-950">
                  {groups.reduce((n, g) => n + g.items.length, 0)} published national indicators
                </h3>
                <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  Mother-to-child transmission, teenage pregnancy, antenatal testing coverage and
                  the eMTCT elimination target — from NSDCC, the KDHS and the Economic Survey,
                  each carrying its source. They are charted together on the impact page, on one
                  axis, so they can actually be read against each other.
                </p>
                <div className="mt-6">
                  <ButtonLink href="/impact" variant="outline" size="md">
                    See the figures charted
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-card border-2 border-navy-200 bg-white p-7">
                <h3 className="text-lg font-extrabold text-navy-950">
                  Indicators are published once they are verified
                </h3>
                <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  Every figure on this site carries a named source and a period. Until an
                  indicator has both, it is not published — a prevalence rate a reader cannot
                  trace is not evidence, it is decoration.
                </p>
                <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  The full reports, including the programme results and the audited accounts, are
                  available now on request.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-card border-2 border-navy-100 bg-white p-6 shadow-card">
              <h3 className="text-lg font-extrabold text-navy-950">Download or request</h3>
              <p className="mt-2 text-[0.8125rem] font-medium leading-relaxed text-navy-600">
                Reports from {site.founded} onward are available. Funders carrying out due
                diligence can ask for anything specific — management accounts, a policy, or the
                auditor&apos;s management letter.
              </p>

              {years.length > 0 ? (
                <ul className="mt-5 space-y-2">
                  {years.map((y) => (
                    <li key={y}>
                      <a
                        href={`/reports/ucc-annual-report-${y}.pdf`}
                        className="group flex items-center justify-between gap-3 rounded-xl border-2 border-navy-100 px-4 py-3 transition-colors hover:border-azure-400 hover:bg-azure-50/50"
                      >
                        <span className="font-bold text-navy-900">Annual report {y}</span>
                        <Download
                          className="size-4 shrink-0 text-azure-600 transition-transform group-hover:translate-y-0.5"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-xl bg-navy-50 px-4 py-3 text-[0.8125rem] font-medium leading-relaxed text-navy-600">
                  PDFs are published here as each audit completes. In the meantime every report is
                  available by email.
                </p>
              )}

              <div className="mt-6 flex flex-col gap-2.5">
                <ButtonLink href="/contact" size="md">
                  <Mail className="size-4" aria-hidden="true" />
                  Request the reports
                </ButtonLink>
                <ButtonLink href="/transparency" size="md" variant="outline">
                  How we are held to account
                </ButtonLink>
              </div>
            </div>

            <div className="rounded-card border-2 border-navy-100 p-6">
              <h3 className="text-base font-extrabold text-navy-950">Our auditors</h3>
              <p className="mt-2 text-[0.8125rem] font-medium leading-relaxed text-navy-600">
                An independent firm of certified public accountants, appointed by the board and
                rotated in line with good practice. The audit goes to the finance and audit
                committee before the full board sees it.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            title="Results are a separate question"
            lead="A set of accounts shows where money went. Whether it changed anything is measured differently, reported separately, and comes with its definitions and sources attached."
          />
          <p className="mt-8">
            <Link
              href="/impact"
              className="text-[0.9375rem] font-bold text-azure-700 underline underline-offset-4"
            >
              See how we measure impact →
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
