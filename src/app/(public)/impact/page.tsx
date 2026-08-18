import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Baby,
  BarChart3,
  HeartPulse,
  PieChart,
  Ribbon,
  Ruler,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

import { ImageRotator } from "@/components/media/image-rotator";
import { CategoryBars } from "@/components/charts/category-bars";
import { DonutChart } from "@/components/charts/donut-chart";
import { IndicatorChart } from "@/components/charts/indicator-chart";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ArrowLink, Section, SectionHeading } from "@/components/ui/primitives";
import { clusterFor } from "@/lib/clusters";
import { IMPACT, split } from "@/lib/gallery";
import { listImpactStats, listPrograms, listProjects } from "@/lib/repos/content";
import { site } from "@/lib/site";
import { listIndicators } from "@/lib/repos/indicators";
import { formatNumber } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Impact",
  description:
    "How Ujasiri Community Care measures results — six-month HIV retention, TB treatment completion, HPV second-dose coverage — and why we report outcomes rather than activity.",
  alternates: { canonical: "/impact" },
};

const icons = {
  Users,
  Ribbon,
  Stethoscope,
  HeartPulse,
  Sparkles,
  PieChart,
  ShieldCheck,
  Baby,
} as const;

const principles = [
  {
    Icon: BarChart3,
    title: "Outcomes, not activity",
    body: "Counting how many people we tested is easy and tells you nothing. How many were still in care six months later is harder to get, and it is the only number that describes change.",
  },
  {
    Icon: Ruler,
    title: "Denominators, always",
    body: "A percentage without the number underneath it is a decoration. Every figure we publish carries its denominator, so you can see what it is a proportion of.",
  },
  {
    Icon: ScanLine,
    title: "Verified at source",
    body: "Our M&E officer verifies data where it is collected, rather than taking field returns at face value. Numbers that only ever move upward are usually numbers nobody is checking.",
  },
  {
    Icon: ShieldCheck,
    title: "The failures are published too",
    body: "Every annual report carries a section on what did not work. This year: six-month linkage fell to 81% after we lost two officers, a screening day turned 60 women away, and HPV second doses reached 68%.",
  },
];

export default async function ImpactPage() {
  const [stats, programs, indicators, allProjects] = await Promise.all([
    listImpactStats(),
    listPrograms(),
    listIndicators(),
    listProjects({ page: 1, perPage: 200 }),
  ]);

  // No money on this page. Spending figures are reported to the board and to
  // funders, not published as a chart here — see the admin for the finance
  // views. `DonutChart` exists for that side of the house.

  // Reach overlaps across programmes, so it is compared, never summed.
  const reach = programs
    .filter((p) => p.people_reached > 0)
    .map((p) => ({
      id: p.id,
      label: p.title,
      value: p.people_reached,
      href: `/programs/${p.slug}`,
    }));

  // Portfolio shape: every project sits in exactly one cluster, so these do
  // partition a whole and a pie is the honest form. Counted from real project
  // records — a project added in the admin moves this without anyone editing a
  // number here.
  const programById = new Map(programs.map((p) => [p.id, p]));
  const clusterCounts = new Map<string, number>();

  for (const project of allProjects.items) {
    const program = project.program_id ? programById.get(project.program_id) : null;
    const cluster = program ? clusterFor(program.slug) : null;
    if (!cluster) continue;
    clusterCounts.set(cluster.shortTitle, (clusterCounts.get(cluster.shortTitle) ?? 0) + 1);
  }

  // Where the work sits, counted the same way. Every project has exactly one
  // county, so this partitions the portfolio too — but with seven counties it
  // is a column chart, not a pie: seven slices cannot be told apart by colour.
  const byCounty = [...allProjects.items
    .reduce((m, p) => m.set(p.region, (m.get(p.region) ?? 0) + 1), new Map<string, number>())
    .entries()]
    .map(([label, value]) => ({ id: label, label, value }))
    .sort((a, b) => b.value - a.value);

  // The prevention work this page is arguing for, taken from the programme
  // records rather than restated here — the titles already carry the message
  // ("Stop GBV", "Ending Early Pregnancy"), so a programme renamed or
  // unpublished in the admin changes this band without anyone editing a page.
  const ADVOCACY_SLUGS = ["gbv-response", "srh-teen-pregnancy", "agyw-health"];
  const advocacy = ADVOCACY_SLUGS
    .map((slug) => programs.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const portfolio = [...clusterCounts.entries()]
    .map(([label, value]) => ({
      label,
      value,
      note: `${value} of our ${allProjects.items.length} projects`,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <PageHero
        title="What actually changed"
        lead="We report the numbers that describe outcomes, including the ones that make us look bad. An organisation that only publishes its wins is asking you to take the rest on faith."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Impact", href: "/impact" },
        ]}
        // Drawn from the shared gallery pool rather than a list pinned here, so
        // adding a photograph to /public/gallery puts it into this rotation
        // without touching this file. IMPACT is a block reserved for this page
        // — transparency and reports were otherwise landing on the same frames,
        // because COMMUNITY is smaller than the windows the three pages draw.
        images={split(IMPACT, 0, 7)}
        imageSeed={2}
      >
        {/* Counted from real records — programmes and projects from the
            database, years from the founding date. Nothing typed in by hand,
            so nothing here can go stale or be wrong. They stagger in under the
            lead so the header resolves as one movement. */}
        <ul className="flex flex-wrap gap-x-10 gap-y-5">
          {[
            { value: String(programs.length), label: "programmes" },
            { value: String(allProjects.items.length), label: "projects" },
            {
              value: String(new Set(allProjects.items.map((p) => p.region)).size),
              label: "counties",
            },
            {
              value: String(new Date().getFullYear() - Number(site.founded)),
              label: "years of delivery",
            },
          ].map((item, i) => (
            <Reveal key={item.label} delay={120 + i * 90} from="up">
              <li className="min-w-24">
                <p className="text-3xl font-extrabold leading-none tracking-tight text-white sm:text-4xl">
                  {item.value}
                </p>
                <p className="mt-2 text-[0.8125rem] font-bold uppercase tracking-wider text-azure-300">
                  {item.label}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </PageHero>

      {/* ------------------------------------------------- Text + photography */}
      {/* The claim the rest of the page has to earn, set beside the work it is
          about. Text and photographs share one reveal sequence so they arrive
          together rather than as two separate animations. */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
          <Reveal from="left">
            <div>
              <h2 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-navy-950 sm:text-4xl">
                A number nobody can trace is not evidence
              </h2>
              <div className="mt-6 space-y-5 text-[1.0625rem] font-medium leading-relaxed text-navy-600">
                <p>
                  Most health programmes report how many people they reached. That figure is easy
                  to collect, moves in only one direction, and describes almost nothing about
                  whether a single person got better.
                </p>
                <p>
                  So the figures on this page are outcomes rather than activity, every one carries
                  a named source and a period, and the ones that moved the wrong way are here
                  alongside the ones that did not.
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  "Every figure carries its source and the period it covers",
                  "Percentages are published with the denominator underneath them",
                  "Indicators that got worse are shown, and marked as worse",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 text-[0.9375rem] font-medium leading-relaxed text-navy-700"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-azure-400"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal from="right" delay={140}>
            <div className="grid grid-cols-2 gap-4">
              <ImageRotator
                images={split(IMPACT, 1, 7)}
                alt="Community health sessions in the counties we work in"
                offset={1}
                interval={5400}
                className="mt-8 aspect-3/4 rounded-card shadow-card"
                sizes="(min-width: 1024px) 22vw, 45vw"
              />
              <ImageRotator
                images={split(IMPACT, 2, 7)}
                alt="Ujasiri Community Care teams at work"
                offset={3}
                interval={6100}
                className="aspect-3/4 rounded-card shadow-card"
                sizes="(min-width: 1024px) 22vw, 45vw"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {stats.length > 0 && (
        <Section>
          <SectionHeading
            title="Last financial year"
            lead="These figures appear in our audited annual report and can be traced to their source."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => {
              const Icon = icons[stat.icon as keyof typeof icons] ?? Users;
              return (
                <Reveal key={stat.id} delay={i * 90}>
                  <div className="group h-full rounded-card border-2 border-azure-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                    <Icon className="size-6 text-azure-600" aria-hidden="true" />
                    <p className="mt-5 text-4xl font-extrabold tracking-tight text-navy-950">
                      {formatNumber(stat.value)}
                      {stat.suffix && <span className="text-azure-600">{stat.suffix}</span>}
                    </p>
                    <p className="mt-2 text-[0.9375rem] font-bold text-navy-900">{stat.label}</p>
                    <p className="mt-1.5 text-[0.8125rem] font-medium leading-relaxed text-navy-500">
                      {stat.note}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Section>
      )}

      {/* ------------------------------------------------------------- Charts */}
      {/* Rendered only where figures have actually been recorded. A chart drawn
          from placeholder numbers is worse than no chart on a page whose whole
          argument is that its figures can be traced to a source. */}
      {(portfolio.length > 0 || reach.length > 0) && (
        <Section>
          <SectionHeading
            title="What the portfolio looks like"
            lead="What we are working on, and how far each programme reached. Counted from real project records — hover any column or slice for the figure underneath it, or open the table below each chart."
          />

          {/* Two columns only when there are two charts. Forcing a 2-column
              grid with a single child left half the row empty, which reads as a
              missing chart rather than a deliberate layout. */}
          <div
            className={
              portfolio.length > 0 && (reach.length > 0 || byCounty.length > 0)
                ? "mt-12 grid gap-6 lg:grid-cols-2"
                : "mt-12 grid gap-6"
            }
          >
            {portfolio.length > 0 && (
              <Reveal>
                <DonutChart
                  title="Projects by programme area"
                  slices={portfolio}
                  variant="pie"
                  totalLabel="projects"
                  valueLabel="Projects"
                />
              </Reveal>
            )}

            {/* Reach by programme is the chart we want here, but it only
                renders once real reach figures are recorded. Until then the
                counties chart holds the column — counted from the same project
                records as the pie, so the row is never half empty. */}
            {reach.length > 0 ? (
              <Reveal delay={120}>
                <CategoryBars
                  title="Reach by programme"
                  data={reach}
                  categoryLabel="Programme"
                />
              </Reveal>
            ) : (
              byCounty.length > 0 && (
                <Reveal delay={120}>
                  <CategoryBars
                    title="Projects by county"
                    data={byCounty}
                    valueLabel="Projects"
                    categoryLabel="County"
                  />
                </Reveal>
              )
            )}
          </div>
        </Section>
      )}

      <Section tone="tint">
        <SectionHeading
          title="How we measure"
          lead="Four rules that decide what goes into a report and what stays out."
        />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((item, i) => (
            <Reveal key={item.title} delay={i * 90} className="h-full">
              <li className="group flex h-full flex-col rounded-card border-2 border-navy-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                    <item.Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm font-bold text-azure-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-navy-950">{item.title}</h3>
                <p className="mt-2.5 text-[0.875rem] font-medium leading-relaxed text-navy-600">
                  {item.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* --------------------------------------------- How reach is counted */}
      {/* The counting rule outlives any particular set of figures, so it is
          stated whether or not there is data to attach it to. */}
      <Section>
        {/* Top-aligned, not centred: the copy is taller than the photograph, so
            centring floated the heading down the page and left it out of step
            with the top of the image. */}
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-start lg:gap-16">
          <Reveal from="left">
          <SectionHeading
            title="How reach is counted"
            lead={`People are counted once per programme they engaged with, so totals across our ${programs.length} programmes overlap — a household reached for HIV testing is often also screened for TB.`}
          />
          <p className="mt-6 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
            We do not sum them into a single headline figure, because that would double-count the
            same people. It is also why reach appears here as bars rather than as a pie: the
            figures do not divide up one total, and a chart that implied they did would be making
            a claim the data cannot support.
          </p>

          </Reveal>

          <Reveal from="right" delay={140}>
            <ImageRotator
              images={split(IMPACT, 3, 7)}
              alt="Outreach teams recording who was reached, and following them up"
              offset={2}
              interval={6400}
              className="aspect-4/5 rounded-card shadow-card"
              sizes="(min-width: 1024px) 28vw, 100vw"
            />
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------- Prevention */}
      {advocacy.length > 0 && (
        <Section tone="tint">
          <SectionHeading
            title="What we are trying to stop"
            lead="Two of the numbers above describe harm that is preventable: violence against women and girls, and pregnancy that ends a girl's schooling. These are the programmes behind them."
            action={<ArrowLink href="/programs">All programmes</ArrowLink>}
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {advocacy.map((program, i) => {
              const Icon = icons[program.icon as keyof typeof icons] ?? ShieldCheck;
              return (
                <Reveal key={program.id} delay={i * 110} className="h-full">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-card border-2 border-navy-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                    <ImageRotator
                      images={split(IMPACT, 4 + i, 7)}
                      alt=""
                      offset={i + 1}
                      interval={5600 + i * 400}
                      overlay
                      className="aspect-16/10 w-full"
                      sizes="(min-width: 1024px) 30vw, 100vw"
                    />

                    <div className="flex flex-1 flex-col p-7">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>

                      <h3 className="mt-5 text-lg font-extrabold leading-snug tracking-tight text-navy-950">
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

                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-azure-700">
                        How this works
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          {/* The urgent route out, for anyone who arrived here needing it now
              rather than needing our results. */}
          <div className="mt-8 rounded-card border-2 border-azure-200 bg-white p-7">
            <p className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">
              <strong className="font-extrabold text-navy-950">If you need help now:</strong>{" "}
              {site.help.urgentNote}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/get-help/gbv" size="md">
                After sexual violence
              </ButtonLink>
              <ButtonLink href="/get-help" size="md" variant="outline">
                Find services near you
              </ButtonLink>
            </div>
          </div>
        </Section>
      )}

      {/* ------------------------------------------------- National context */}
      {/* Published national figures, each carrying its source. This is the
          epidemic we work inside — public information anybody can verify, and
          it asserts nothing about UCC's own performance. */}
      {indicators.length > 0 && (
        <Section tone="tint">
          <SectionHeading
            title="The epidemic we work inside"
            lead="National figures from NSDCC, the KDHS and the Economic Survey, each carrying its source. They are the backdrop our own results have to be read against — not our numbers, and not presented as such."
          />
          {/* One figure, not one per category. Every indicator here is a
              percentage, so they share a 0–100 scale and belong on a single
              baseline — split across four cards they could not be compared,
              which is the whole point of putting them on a chart. */}
          <div className="mt-12">
            <Reveal>
              <IndicatorChart
                title="Published national figures"
                indicators={indicators}
              />
            </Reveal>
          </div>
        </Section>
      )}

      <Section tone="tint">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            align="center"
            title="Read the full report"
            lead="Audited accounts, programme results measured against what we said we would do, and the section on what did not work."
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/reports">Annual reports</ButtonLink>
            <ButtonLink href="/transparency" variant="outline">
              Where the money goes
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
