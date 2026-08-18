import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Target, Users } from "lucide-react";

import { ImageRotator } from "@/components/media/image-rotator";
import { MediaSlot } from "@/components/media/media-slot";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { deal } from "@/lib/gallery";
import { getProject, listProjects } from "@/lib/repos/content";
import { formatDate, formatMoney, formatNumber, percent } from "@/lib/utils";

export const revalidate = 1800;

export async function generateStaticParams() {
  const { items } = await listProjects({ page: 1, perPage: 100 });
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Not found" };

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary },
  };
}

/**
 * Project detail.
 *
 * Follows the structure the sector uses — CHAK's project pages are the clearest
 * example: named pillars across the top, then Duration, Coverage, Purpose,
 * Expected Outcomes, Target Populations and Local Implementing Partners as
 * distinct labelled blocks.
 *
 * That is not imitation for its own sake. It is the shape a county health team
 * or a prospective funder already knows how to read, and every block in it is
 * a commitment somebody can hold the organisation to.
 *
 * Every block is conditional. A project with no recorded pillars, outcomes or
 * partners simply omits those sections — the page never renders an empty
 * heading or a placeholder.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const funded = percent(project.raised_cents, project.budget_cents);

  const trail = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: project.title, href: `/projects/${project.slug}` },
  ];

  const period =
    project.started_on &&
    `${formatDate(project.started_on)} – ${
      project.completed_on ? formatDate(project.completed_on) : "ongoing"
    }`;

  /** Labelled metadata blocks, built only from values that were recorded. */
  const facts = [
    period && { label: "Duration", value: period },
    project.counties.length > 0
      ? {
          label: "Coverage",
          value: `${project.counties.length} counties: ${project.counties.join(", ")}`,
        }
      : project.location && { label: "Coverage", value: project.location },
    project.funder && { label: "Funding", value: project.funder },
    project.reporting_line && { label: "Reports to", value: project.reporting_line },
    project.target && { label: "Commitment", value: project.target },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <BreadcrumbJsonLd trail={trail} />

      <PageHero
        title={project.title}
        lead={project.summary}
        breadcrumbs={trail}
        images={deal(project.id, 0, 6)}
        imageSeed={project.id % 5}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-white/80">
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-azure-300" aria-hidden="true" />
            {project.location}
          </span>
          {project.beneficiaries > 0 && (
            <span className="flex items-center gap-2">
              <Users className="size-4 text-azure-300" aria-hidden="true" />
              {formatNumber(project.beneficiaries)} people reached
            </span>
          )}
          {period && (
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-azure-300" aria-hidden="true" />
              {period}
            </span>
          )}
        </div>
      </PageHero>

      {/* ------------------------------------------------------------ Pillars */}
      {/* Numbered workstreams across the top — the first thing CHAK shows,
          because it answers "what does this actually consist of" before
          anything else. */}
      {project.pillars.length > 0 && (
        <section className="border-b border-navy-100 bg-azure-50/60">
          <div className="container-page py-12">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {project.pillars.map((pillar, i) => (
                <Reveal key={pillar.title} delay={i * 90}>
                  <div className="h-full rounded-card border-2 border-azure-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-azure-400 hover:shadow-card">
                    <span className="font-mono text-xs font-bold text-azure-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-3 text-lg font-extrabold leading-snug text-navy-950">
                      {pillar.title}
                    </h2>
                    <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                      {pillar.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16 lg:py-20">
        <div>
          {project.cover_image ? (
            <MediaSlot
              src={project.cover_image}
              alt={`${project.title} in ${project.location}`}
              ratio="wide"
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
          ) : (
            <ImageRotator
              images={deal(project.id, 1, 6)}
              alt={`Work under ${project.title}`}
              offset={project.id % 5}
              priority
              className="aspect-16/10 rounded-card shadow-card"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
          )}

          {project.purpose && (
            <div className="mt-10">
              <h2 className="text-2xl font-extrabold tracking-tight text-navy-950">Purpose</h2>
              <p className="mt-3 text-lg font-medium leading-relaxed text-navy-700">
                {project.purpose}
              </p>
            </div>
          )}

          {project.body && (
            <div className="prose-ucc mt-10 max-w-none">
              {project.body.split("\n\n").map((block, i) => {
                const text = block.trim();
                if (!text) return null;
                if (text.startsWith("## ")) return <h2 key={i}>{text.slice(3)}</h2>;
                return <p key={i}>{text}</p>;
              })}
            </div>
          )}

          {project.outcomes.length > 0 && (
            <div className="mt-12 rounded-card border-2 border-navy-100 bg-navy-50/60 p-7">
              <h2 className="flex items-center gap-2.5 text-xl font-extrabold text-navy-950">
                <Target className="size-5 text-azure-600" aria-hidden="true" />
                Expected outcomes
              </h2>
              <ul className="mt-5 space-y-3">
                {project.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-azure-500"
                    />
                    <span className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                      {outcome}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.target_populations.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-extrabold text-navy-950">Target populations</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.target_populations.map((group) => (
                  <li key={group}>
                    <span className="inline-flex rounded-full bg-azure-50 px-3.5 py-1.5 text-sm font-bold text-azure-800 ring-1 ring-inset ring-azure-200">
                      {group}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.implementing_partners.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-extrabold text-navy-950">
                Local implementing partners
              </h2>
              <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                Who delivers this on the ground, county by county — published so a community can
                verify who is actually working in their area.
              </p>
              <ul className="mt-5 divide-y divide-navy-100 border-y border-navy-100">
                {project.implementing_partners.map((partner) => (
                  <li
                    key={`${partner.county}-${partner.name}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-3"
                  >
                    <span className="font-bold text-navy-900">{partner.name}</span>
                    <span className="text-sm font-semibold text-navy-500">{partner.county}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {facts.length > 0 && (
            <div className="rounded-card border-2 border-navy-100 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-navy-950">At a glance</h2>
                <Badge tone={project.status === "completed" ? "azure" : "green"}>
                  {project.status}
                </Badge>
              </div>

              <dl className="mt-5 divide-y divide-navy-100 text-sm">
                {facts.map((fact) => (
                  <div key={fact.label} className="py-3 first:pt-0 last:pb-0">
                    <dt className="text-xs font-bold uppercase tracking-wide text-navy-500">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 font-semibold leading-relaxed text-navy-900">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {project.budget_cents === 0 && (
                <div className="mt-5 border-t border-navy-100 pt-5">
                  <ButtonLink href="/donate" size="md" className="w-full">
                    Support this work
                  </ButtonLink>
                </div>
              )}

              {project.budget_cents > 0 && (
                <div className="mt-5 border-t border-navy-100 pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-navy-700">Funded</span>
                    <span className="text-2xl font-extrabold text-navy-950">{funded}%</span>
                  </div>
                  <div
                    className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-navy-100"
                    role="img"
                    aria-label={`${funded} per cent funded`}
                  >
                    <div
                      className="h-full rounded-full bg-azure-500"
                      style={{ width: `${funded}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-navy-500">
                    {formatMoney(project.raised_cents, "KES", { compact: true })} of{" "}
                    {formatMoney(project.budget_cents, "KES", { compact: true })} raised
                  </p>
                  <ButtonLink href="/donate" size="md" className="mt-5 w-full">
                    Fund this project
                  </ButtonLink>
                </div>
              )}
            </div>
          )}

          <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-6">
            <h2 className="text-lg font-extrabold text-navy-950">Need this service?</h2>
            <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
              Everything under this project is free and confidential.
            </p>
            <ButtonLink href="/get-help" size="md" variant="outline" className="mt-4 w-full">
              Find help near you
            </ButtonLink>
          </div>

          <p className="text-sm font-medium text-navy-600">
            <Link href="/projects" className="font-bold text-azure-700 underline underline-offset-4">
              ← All projects
            </Link>
          </p>
        </aside>
      </div>
    </>
  );
}
