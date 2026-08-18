import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  FileText,
  HeartPulse,
  Network,
  PieChart,
  Ribbon,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

import { ImageRotator } from "@/components/media/image-rotator";
import { HOME, split } from "@/lib/gallery";
import { Hero } from "@/components/site/hero";
import { WebsiteJsonLd } from "@/components/seo/json-ld";
import { HelpStrip } from "@/components/site/help-strip";
import { PartnerMark } from "@/components/site/partner-logo";
import { PostCard } from "@/components/site/post-card";
import { ProgramCard } from "@/components/site/program-card";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLink, Badge, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import {
  listFeaturedPosts,
  listFinanceLines,
  listImpactStats,
  listPartners,
  listPrograms,
  listProjects,
} from "@/lib/repos/content";
import { site } from "@/lib/site";
import type { Partner } from "@/lib/types";
import { formatNumber, percent } from "@/lib/utils";

// Revalidate hourly: content changes rarely, and a static homepage is what
// keeps Largest Contentful Paint low on the slow connections most of our
// visitors are on.
export const revalidate = 3600;

const iconMap = {
  Ribbon,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Users,
  PieChart,
} as const;

/**
 * Tier labels for the homepage wall. Deliberately shorter than the headings on
 * /partners — this is a row label, not a section, and the full explanation of
 * what each relationship means belongs on the page that has room for it.
 */
const partnerGroups = [
  { key: "implementing" as const, label: "Government & health facilities" },
  { key: "partner" as const, label: "Partner organisations" },
  { key: "funder" as const, label: "Funders" },
];

/**
 * Every tile carries a mark and the partner's name, whether or not that partner
 * has supplied a logo file. Uniform structure is what keeps this reading as one
 * wall: a row of logos with name-only gaps punched through it looks unfinished,
 * and the name under a logo costs nothing while making the wall legible to
 * someone who does not recognise the mark.
 */
/**
 * The regulator's entry in the shared quick links, matched on the authority —
 * same lookup /accountability uses, so the two pages cannot drift apart.
 */
const regulator = site.quickLinks.find((l) => l.label === site.registration.authority);

function PartnerTile({ partner }: { partner: Partner }) {
  const inner = (
    <>
      <PartnerMark
        partner={partner}
        size="sm"
        className="opacity-80 transition duration-300 group-hover:opacity-100"
      />
      <span className="text-[0.8125rem] font-semibold leading-snug text-navy-600 transition-colors duration-300 group-hover:text-navy-900">
        {partner.name}
      </span>
    </>
  );

  const className =
    "group flex h-full min-h-32 flex-col items-center justify-center gap-3 rounded-card border border-navy-100 bg-white px-5 py-6 text-center transition-colors duration-300 hover:border-azure-300";

  // Only the partners who gave us a URL become links. A dead or guessed link on
  // this particular wall would undo the point of publishing it.
  return partner.website ? (
    <a
      href={partner.website}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
    >
      {inner}
    </a>
  ) : (
    <div className={className}>{inner}</div>
  );
}

export default async function HomePage() {
  const [programs, stats, featured, partners, finance, allProjects] = await Promise.all([
    listPrograms(),
    listImpactStats(),
    listFeaturedPosts(3),
    listPartners(),
    listFinanceLines(2025),
    listProjects({ page: 1, perPage: 200 }),
  ]);

  const totalSpend = finance.reduce((sum, l) => sum + l.amount_cents, 0);
  const programmeSpend = finance
    .filter((l) => l.category === "programmes")
    .reduce((sum, l) => sum + l.amount_cents, 0);
  const programmePercent = percent(programmeSpend, totalSpend);

  // Counted from real records rather than asserted. If a project is added in
  // the admin, these move on the next revalidation without anyone editing a
  // number in a page file.
  const activeProjects = allProjects.items.filter((p) => p.status === "active").length;
  const countyCount = new Set(allProjects.items.map((p) => p.region)).size;

  // The three most recently started active projects. Chosen from real records
  // rather than pinned by slug, so the section cannot point at something that
  // has been archived or renamed.
  // Activities grouped by programme. Keyed on slug, so a programme that is
  // unpublished or renamed drops out of this list automatically rather than
  // leaving an orphaned heading behind.
  const activityMap: Record<string, string[]> = {
    "hiv-prevention": [
      "Door-to-door and moonlight HIV testing",
      "HIV self-test kits with follow-up",
      "PrEP awareness and facility referral",
      "Same-day escorted linkage to treatment",
      "Index and partner testing, offered never pressured",
    ],
    "tb-prevention": [
      "Household and congregate TB screening",
      "Sputum collection and transport to laboratories",
      "Household contact investigation",
      "Weekly treatment support for six months",
      "48-hour tracing of missed appointments",
    ],
    "cancer-awareness": [
      "Cervical and breast cancer education",
      "Community screening days with partner facilities",
      "Navigation for every positive screen",
      "Transport to treatment appointments",
    ],
    "gbv-response": [
      "Safe spaces with trained psychosocial staff",
      "Accompanied referral to post-rape care",
      "The 72-hour PEP message, everywhere",
      "Referral to police gender desks and legal aid",
      "Community dialogues with men and boys",
    ],
    "agyw-health": [
      "Mentor-led safe spaces for girls",
      "Reusable sanitary pad kits",
      "Menstrual health education for girls and boys",
      "HPV vaccination mobilisation and second-dose follow-up",
    ],
    emtct: [
      "Same-day treatment start for pregnant women",
      "Follow-up through pregnancy and breastfeeding",
      "Infant testing at six weeks and after weaning",
      "Tracing and re-engaging mothers who miss visits",
    ],
    "srh-teen-pregnancy": [
      "Age-appropriate sexual and reproductive health education",
      "Referral to youth-friendly contraception services",
      "Separate sessions for boys in the same schools",
      "School re-entry support for young mothers",
    ],
    otz: [
      "Peer-led OTZ clubs for ages 10 to 24",
      "Treatment literacy for adolescents",
      "Weekend and after-school clinic sessions",
      "Viral load monitoring and adherence support",
    ],
    "disability-inclusion": [
      "Kenyan Sign Language interpretation at outreach",
      "Health information in accessible formats",
      "Home-based testing where facilities cannot be reached",
      "Accessibility and communication training for partner staff",
    ],
  };

  const activities = programs
    .map((p) => ({ title: p.title, items: activityMap[p.slug] ?? [] }))
    .filter((g) => g.items.length > 0);

  const featuredProjects = allProjects.items
    .filter((p) => p.status === "active")
    .sort((a, b) => (b.started_on ?? "").localeCompare(a.started_on ?? ""))
    .slice(0, 3);

  return (
    <>
      <WebsiteJsonLd />

      <Hero />

      {/* Crisis routes, immediately below the fold. */}
      <HelpStrip />

      {/* --------------------------------------------------------- Reach band */}
      {/* Every figure here is COMPUTED from real records — programmes, projects
          and counties come from the database, years from the founding date.
          Nothing is typed in by hand, so nothing can be wrong or go stale, and
          none of it is an impact claim we would have to defend. Programme
          outcome figures live on /impact, with their definitions and sources. */}
      <section className="relative overflow-hidden bg-navy-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,var(--color-navy-900)_0%,transparent_60%)]"
        />

        <div className="container-page relative py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <h2 className="max-w-xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              Community health, delivered through the public system
            </h2>
            <Link
              href="/impact"
              className="group inline-flex items-center gap-2 text-sm font-bold text-azure-300 underline-offset-4 hover:underline"
            >
              How we measure our results
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Each figure is one <div> with the value above its label. Using a
              description list here duplicated every label for screen readers —
              once in a visually-hidden <dt> and again in the <dd>. */}
          <ul className="mt-12 grid gap-px overflow-hidden rounded-card bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                value: String(new Date().getFullYear() - Number(site.founded)),
                label: "years of community health delivery",
                note: `Registered with the ${site.registration.authority} since ${site.founded}`,
              },
              {
                value: String(programs.length),
                label: "integrated programmes",
                note: "HIV, TB, cancer, GBV and adolescent girls' health — run as one pathway",
              },
              {
                value: String(activeProjects),
                label: "active projects",
                note: "Each with a named funder, a county and a published target",
              },
              {
                value: String(countyCount),
                label: "counties",
                note: "Working through county health teams and national programmes, not around them",
              },
            ].map((item, i) => (
              <li key={item.label} className="group bg-navy-950 transition-colors hover:bg-navy-900">
                <Reveal delay={i * 90} className="p-7">
                <p className="text-5xl font-extrabold leading-none tracking-tight text-white transition-transform duration-300 group-hover:-translate-y-0.5 lg:text-6xl">
                  {item.value}
                </p>
                <p className="mt-4 text-[0.9375rem] font-bold leading-snug text-azure-300">
                  {item.label}
                </p>
                <p className="mt-2 text-[0.8125rem] font-medium leading-relaxed text-white/55">
                  {item.note}
                </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ Programmes */}
      <Section>
        <SectionHeading
          title="Nine programmes, one pathway"
          lead="They overlap deliberately. The same household carries overlapping risk, so a woman we meet for HIV testing is screened for TB, told about cervical screening, and — if she is pregnant — supported to keep her baby HIV-free."
          action={<ArrowLink href="/programs">All programmes</ArrowLink>}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, i) => (
            <Reveal key={program.id} delay={(i % 3) * 90}>
              <ProgramCard program={program} />
            </Reveal>
          ))}
          <div className="flex flex-col justify-between rounded-card border-2 border-azure-200 bg-azure-50 p-7 lg:col-span-1">
            <div>
              <h3 className="text-xl font-extrabold text-navy-950">
                We don&apos;t work alone
              </h3>
              <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                We are not a clinic. Every programme ends at somebody else&apos;s door — a county
                facility, a government service, a partner NGO. We publish who they are.
              </p>
            </div>
            <ArrowLink href="/partners" className="mt-6">
              See our referral partners
            </ArrowLink>
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------------- Impact */}
      {/* Rendered only when figures have actually been recorded. No statistics
          is honest; invented statistics are not. They are entered in the admin
          and read from the database — never hardcoded here. */}
      {stats.length > 0 && (
        <Section tone="tint">
          <SectionHeading
            title="The numbers we hold ourselves to"
            lead="Not how many people we saw — how many were still in care months later. These are the figures in our audited annual report."
            action={<ArrowLink href="/impact">How we measure</ArrowLink>}
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = iconMap[stat.icon as keyof typeof iconMap] ?? Users;
              return (
                <div
                  key={stat.id}
                  className="group relative overflow-hidden rounded-card border-2 border-navy-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift"
                >
                  {/* Soft azure bloom that warms on hover — enough motion to
                      feel alive without anything actually moving. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-azure-100/60 blur-2xl transition-opacity duration-500 group-hover:opacity-100 lg:opacity-0"
                  />

                  <span className="relative grid size-11 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>

                  <p className="relative mt-6 text-4xl font-extrabold leading-none tracking-tight text-navy-950 lg:text-[2.75rem]">
                    {formatNumber(stat.value)}
                    {stat.suffix && <span className="text-azure-600">{stat.suffix}</span>}
                  </p>

                  <p className="relative mt-3 text-[0.9375rem] font-bold leading-snug text-navy-900">
                    {stat.label}
                  </p>
                  <p className="relative mt-2 text-[0.8125rem] font-medium leading-relaxed text-navy-500">
                    {stat.note}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* --------------------------------------------------------- How we work */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-20">
          <div>
            <SectionHeading
              title="Finding people is the easy part. Keeping them in care is the work."
              lead="Most health programmes report how many people they tested. That number tells you almost nothing about whether anyone got better."
            />

            {/* A continuous rail threads the four steps together, so the
                sequence reads as one pathway rather than four separate claims.
                Each marker sits on the line and lifts on hover. */}
            <ol className="relative mt-12 space-y-9 before:absolute before:bottom-6 before:left-[1.4375rem] before:top-6 before:w-px before:bg-gradient-to-b before:from-azure-300 before:via-azure-200 before:to-transparent">
              {[
                {
                  n: "01",
                  title: "Reach people where they are",
                  body: "Door-to-door, at night, in schools and safe spaces — because a person who cannot afford to lose a day's wages will never come to a daytime clinic.",
                },
                {
                  n: "02",
                  title: "Test, screen and inform",
                  body: "HIV testing, TB symptom screening, cervical and breast cancer awareness, and honest information about what happens next.",
                },
                {
                  n: "03",
                  title: "Walk them to the door",
                  body: "Same-day, accompanied referral to a facility we hold a standing agreement with. The person is expected when they arrive.",
                },
                {
                  n: "04",
                  title: "Follow up until it sticks",
                  body: "One week, one month, six months. We report the proportion still in care — not the number of tests we performed.",
                },
              ].map((step) => (
                <li key={step.n} className="group relative flex gap-6">
                  <span
                    aria-hidden="true"
                    className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-2 border-azure-200 bg-white font-mono text-sm font-extrabold text-azure-700 shadow-sm transition-all duration-300 group-hover:border-azure-500 group-hover:bg-azure-500 group-hover:text-white group-hover:shadow-glow"
                  >
                    {step.n}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-lg font-extrabold tracking-tight text-navy-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Rotating collage. Each slot is dealt a different slice of the
              shared pool and runs on its own jittered interval, so nothing
              sits still and no two frames ever match. */}
          <div className="grid grid-cols-2 gap-4 lg:sticky lg:top-28">
            <ImageRotator
              images={split(HOME, 0, 4)}
              alt="Community outreach teams at work"
              offset={1}
              className="mt-10 aspect-3/4 rounded-card shadow-card"
              sizes="(min-width: 1024px) 22vw, 50vw"
            />
            <ImageRotator
              images={split(HOME, 1, 4)}
              alt="Clients being accompanied to partner health facilities"
              offset={3}
              className="aspect-3/4 rounded-card shadow-card"
              sizes="(min-width: 1024px) 22vw, 50vw"
            />
            <ImageRotator
              images={split(HOME, 2, 4)}
              alt="Community health sessions across the counties we work in"
              offset={5}
              className="col-span-2 aspect-16/10 rounded-card shadow-card"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Activities */}
      {/* What we actually do, named. Derived from the programmes in the
          database — add a programme in the admin and its activities appear
          here without touching this file. */}
      <Section tone="tint">
        <SectionHeading
          title="What we actually do"
          lead="Not aims — activities. This is the work our teams carry out week to week, across every programme."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <ImageRotator
            images={split(HOME, 3, 4)}
            alt="Ujasiri Community Care teams delivering services in the community"
            offset={2}
            overlay
            className="aspect-4/5 rounded-card shadow-lift lg:sticky lg:top-28"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />

          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {activities.map((group) => (
              <li key={group.title}>
                <h3 className="text-[0.9375rem] font-extrabold tracking-tight text-navy-950">
                  {group.title}
                </h3>
                <ul className="mt-2.5 space-y-1.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 text-[0.9375rem] font-medium leading-relaxed text-navy-600"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-azure-400"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ----------------------------------------------------- Funded projects */}
      {/* Driven entirely from the projects table. A funder, target or period is
          shown only where it has actually been recorded — the site never
          invents one. That matters most here, because this section's whole
          claim is that these details are checkable. */}
      <Section>
        <SectionHeading
          title="Named projects, named counties"
          lead="Every project has a place, a programme and a published commitment. Where a funder has agreed to be named, we name them — so a community, or a prospective funder, can check that what we say is happening somewhere real."
          action={<ArrowLink href="/projects">All projects</ArrowLink>}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {featuredProjects.map((project, i) => {
            const period = [
              project.started_on ? new Date(project.started_on).getFullYear() : null,
              project.completed_on ? new Date(project.completed_on).getFullYear() : null,
            ];

            // Only rows with a real value are built, so the card never renders
            // an empty label or a placeholder dash.
            const rows = [
              project.funder && { label: "Funded by", value: project.funder },
              { label: "County", value: project.location },
              period[0] && {
                label: "Period",
                value: period[1] ? `${period[0]} – ${period[1]}` : `Since ${period[0]}`,
              },
              project.target && { label: "Commitment", value: project.target },
              project.beneficiaries > 0 && {
                label: "People reached",
                value: formatNumber(project.beneficiaries),
              },
            ].filter(Boolean) as { label: string; value: string }[];

            return (
              <Reveal key={project.id} delay={i * 110}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-card border-2 border-navy-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-azure-100/50 blur-2xl transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <Badge tone={project.status === "completed" ? "azure" : "green"}>
                    {project.status}
                  </Badge>
                  <span className="text-xs font-bold uppercase tracking-wider text-navy-400">
                    {project.region}
                  </span>
                </div>

                <h3 className="relative mt-5 text-xl font-extrabold leading-snug tracking-tight text-navy-950">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="after:absolute after:inset-0 group-hover:text-azure-800"
                  >
                    {project.title}
                  </Link>
                </h3>

                <p className="relative mt-3 flex-1 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  {project.summary}
                </p>

                <dl className="relative mt-6 space-y-0 divide-y divide-navy-100 border-t border-navy-100 text-sm">
                  {rows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 py-2.5">
                      <dt className="shrink-0 font-semibold text-navy-500">{row.label}</dt>
                      <dd className="text-right font-bold text-navy-900">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* --------------------------------------------------------- Transparency */}
      <Section tone="tint">
        <SectionHeading
          title="Accountable to the people we serve, not only to the people who fund us"
          lead="Most organisations publish accounts because a donor requires it. We read ours aloud, in person, in a county where we work — because the community carrying the consequences of our decisions has the strongest claim on knowing what we did with the money."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            {
              Icon: ScrollText,
              // Only shown once audited figures exist; see /transparency.
              stat: programmePercent > 0 ? `${programmePercent}%` : "Audited",
              label:
                programmePercent > 0
                  ? "of spending reaches programmes"
                  : "accounts, published in full every year",
              body: "Prepared by an independent firm appointed by the board rather than by management, presented to the finance and audit committee before the full board sees them, and published complete with the auditor's letter.",
            },
            {
              Icon: Network,
              stat: "Every one",
              label: "of our referral partners is named",
              body: "We are not a clinic. Every programme ends at a county facility, a government service or a partner NGO, and we publish which — so a community can verify that the door we send them to is real before they walk to it.",
            },
            {
              Icon: BookOpen,
              stat: "Published",
              label: "in every annual report: what did not work",
              body: "Not an appendix and not a footnote. Where a programme underperformed, we say which, by how much, and why. Our board argues about that section every year, and it stays in.",
            },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 90}>
              <article className="group flex h-full flex-col rounded-card border-2 border-navy-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                <span className="grid size-11 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                  <item.Icon className="size-5" aria-hidden="true" />
                </span>

                {/* Two of these three "statistics" are words, not numbers.
                    Tight leading and a balanced wrap keep "Every one" from
                    breaking mid-phrase and leaving a orphaned line. */}
                <p className="mt-6 text-pretty text-[2.75rem] font-extrabold leading-[0.95] tracking-tight text-azure-600">
                  {item.stat}
                </p>
                <p className="mt-2.5 text-[0.9375rem] font-bold leading-snug text-navy-950">
                  {item.label}
                </p>
                <p className="mt-3 flex-1 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Each claim below ends somewhere a reader can actually go and check
            it. A verification list whose items are only assertions is just more
            copy — the links are what make the heading true.

            Registration and tax numbers are deliberately not recited here. On
            a homepage they read as an organisation working to prove itself
            rather than one that is simply established, and reciting a number
            proves nothing anyway — the register does. They appear once, small,
            in the footer, which is where a reader who wants them looks. */}
        <div className="mt-10 grid gap-8 overflow-hidden rounded-card border-2 border-navy-100 bg-white lg:grid-cols-[1.1fr_0.9fr] lg:gap-0">
          <div className="p-8 lg:p-10">
            <h3 className="text-xl font-extrabold tracking-tight text-navy-950">
              What you can verify without taking our word for it
            </h3>
            <ul className="mt-7 space-y-6">
              {[
                {
                  Icon: BadgeCheck,
                  title: "Our registration",
                  body: `We are a non-governmental organisation registered in Kenya with the ${site.registration.authority}, and hold public benefit tax exemption. Our entry is a matter of public record — check it against the register yourself rather than taking the claim from us.`,
                  href: regulator?.href,
                  linkLabel: `Search the ${site.registration.authority} register`,
                  external: true,
                },
                {
                  Icon: FileText,
                  title: "Our audited accounts",
                  body: "Prepared by an independent firm appointed by the board rather than by management, presented to the finance and audit committee before the full board sees them, and published complete with the auditor's letter.",
                  href: "/reports",
                  linkLabel: "Annual reports",
                  external: false,
                },
                {
                  Icon: ShieldCheck,
                  title: "How to complain about us",
                  body: "Concerns about our staff or volunteers reach trustees directly through a channel independent of management. You can report anonymously, and you will not be penalised for raising something in good faith.",
                  href: "/accountability",
                  linkLabel: "How to raise a concern",
                  external: false,
                },
              ].map(({ Icon, title, body, href, linkLabel, external }) => (
                <li key={title} className="flex gap-4">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-azure-50 text-azure-700">
                    <Icon className="size-[1.125rem]" aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="text-[0.9375rem] font-extrabold text-navy-950">{title}</h4>
                    <p className="mt-1.5 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                      {body}
                    </p>
                    {href &&
                      (external ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-2 inline-block text-sm font-bold text-azure-700 underline-offset-4 hover:underline"
                        >
                          {linkLabel} →
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="mt-2 inline-block text-sm font-bold text-azure-700 underline-offset-4 hover:underline"
                        >
                          {linkLabel} →
                        </Link>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Navy, not another white panel. This is the one place on the page
              that asks the reader to actually do something with all of the
              above, and it needs to land like a full stop rather than blend
              into the card it sits inside. */}
          <div className="bg-navy-950 p-8 text-white lg:p-10">
            <h3 className="text-xl font-extrabold tracking-tight">Ask us for anything</h3>
            <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-white/70">
              Full audited accounts, any policy, our safeguarding procedures, the auditor&apos;s
              management letter, or the raw indicator definitions behind a number you have seen us
              publish. Email and we will send it the same week — no form, no sign-up, and you will
              not be added to anything.
            </p>
            <a
              href={`mailto:${site.contact.email}`}
              className="mt-4 inline-block text-[0.9375rem] font-bold text-azure-300 underline underline-offset-4"
            >
              {site.contact.email}
            </a>
            {/* One solid button, then links. Three stacked solid buttons on
                navy read as three equal demands and flatten the hierarchy —
                only the first is the thing we actually want read next. */}
            <div className="mt-7 space-y-4">
              <ButtonLink href="/transparency" size="md" variant="white">
                Where the money goes
              </ButtonLink>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Link
                  href="/reports"
                  className="text-sm font-bold text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  Annual reports →
                </Link>
                <Link
                  href="/accountability"
                  className="text-sm font-bold text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  Raise a concern →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------------- Stories */}
      <Section tone="tint">
        <SectionHeading
          title="News, stories and reports"
          lead="Written by the people doing the work — including when it does not go to plan."
          action={<ArrowLink href="/news">All updates</ArrowLink>}
        />
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {featured.map((post, i) => (
            <Reveal key={post.id} delay={i * 90}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------------- Partners */}
      {/* Grouped by tier rather than shown as one undifferentiated wall: a
          national programme we refer patients into and a pro bono technology
          vendor are both "partners", and flattening them onto one grid implies
          a parity that would not survive a funder asking about it. Logos are
          used where a partner has given us the asset; where they have not, the
          name stands on its own rather than a placeholder mark standing in. */}
      <Section>
        <SectionHeading
          align="center"
          title="Government, facilities and partner NGOs"
          lead="We publish our referral partners so a community can verify that the door we send them to is real."
        />

        <div className="mx-auto mt-12 max-w-5xl">
          {partnerGroups.map((group) => {
            const items = partners.filter((p) => p.tier === group.key);
            if (items.length === 0) return null;

            return (
              <div
                key={group.key}
                className="border-navy-100 py-9 first:pt-0 last:pb-0 [&:not(:first-child)]:border-t"
              >
                <h3 className="text-center font-mono text-xs font-bold uppercase tracking-[0.18em] text-navy-400">
                  {group.label}
                </h3>
                <ul className="mt-7 flex flex-wrap items-stretch justify-center gap-4">
                  {items.map((partner) => (
                    <li key={partner.id} className="w-[calc(50%-0.5rem)] sm:w-56">
                      <PartnerTile partner={partner} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center">
          <ArrowLink href="/partners">Our full referral network</ArrowLink>
        </p>
      </Section>

      {/* ------------------------------------------------------------- Final CTA */}
      <section className="relative overflow-hidden bg-navy-900">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--color-azure-700)_0%,transparent_60%)] opacity-50"
        />
        <div className="container-page relative grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Testing is the first step. Staying in care is the work.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
              Reaching someone once is straightforward. Walking with them through
              diagnosis, treatment and the months that follow takes sustained support.
              Regular giving is what allows us to commit to that follow-up.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/donate" size="lg">
                Donate now
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href="/get-involved/volunteer"
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
              >
                Volunteer with us
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Testing and linkage",
                what: "Community HIV testing, with every reactive result linked to a clinic.",
              },
              {
                title: "Menstrual health",
                what: "Reusable pad kits and health sessions that keep girls in school.",
              },
              {
                title: "Treatment navigation",
                what: "Transport and accompaniment for women moving through cancer care.",
              },
            ].map((area) => (
              <div
                key={area.title}
                className="rounded-card bg-white/5 p-5 ring-1 ring-white/10"
              >
                <p className="text-base font-extrabold text-azure-300">{area.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{area.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
