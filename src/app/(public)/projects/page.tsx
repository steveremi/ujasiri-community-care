import type { Metadata } from "next";
import Link from "next/link";

import { ImageRotator } from "@/components/media/image-rotator";
import { PageHero } from "@/components/site/page-hero";
import { ProjectCard } from "@/components/site/project-card";
import { EmptyState, Section, SectionHeading } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { clusters } from "@/lib/clusters";
import { deal } from "@/lib/gallery";
import { listPrograms, listProjects } from "@/lib/repos/content";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Projects & Programmes",
  description:
    "Every project Ujasiri Community Care runs, grouped by programme area — HIV and TB, adolescents and young people, protection and gender, cancer screening and inclusion.",
  alternates: { canonical: "/projects" },
};

/**
 * Projects & Programmes.
 *
 * Grouped by cluster rather than listed flat, which is how CHAK and Ciheb both
 * present their portfolios. The grouping reflects delivery reality — one field
 * team covers everything in a cluster — so it helps a reader understand the
 * work rather than just index it.
 */
export default async function ProjectsPage() {
  const [all, programs] = await Promise.all([
    listProjects({ page: 1, perPage: 200 }),
    listPrograms(),
  ]);

  const programBySlug = new Map(programs.map((p) => [p.slug, p]));
  const programIdsFor = (slugs: string[]) =>
    new Set(slugs.map((s) => programBySlug.get(s)?.id).filter(Boolean) as number[]);

  const grouped = clusters
    .map((cluster) => {
      const ids = programIdsFor(cluster.programs);
      return {
        cluster,
        projects: all.items.filter((p) => p.program_id && ids.has(p.program_id)),
        programs: cluster.programs
          .map((slug) => programBySlug.get(slug))
          .filter(Boolean),
      };
    })
    .filter((g) => g.projects.length > 0 || g.programs.length > 0);

  // Anything whose programme is not yet assigned to a cluster still needs to
  // appear, rather than silently vanishing from the portfolio.
  const clustered = new Set(grouped.flatMap((g) => g.projects.map((p) => p.id)));
  const unclustered = all.items.filter((p) => !clustered.has(p.id));

  return (
    <>
      <PageHero
        title="Projects & Programmes"
        lead="Everything we run, grouped by programme area. Each project has a place, a commitment and — where the funder has agreed to be named — a funder."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Projects", href: "/projects" },
        ]}
      >
        <nav aria-label="Jump to programme area" className="flex flex-wrap gap-2">
          {grouped.map(({ cluster }) => (
            <a
              key={cluster.slug}
              href={`#${cluster.slug}`}
              className="rounded-full border-2 border-navy-200 bg-white px-4 py-2 text-sm font-bold text-navy-800 transition-colors hover:border-azure-400 hover:bg-azure-50"
            >
              {cluster.shortTitle}
            </a>
          ))}
        </nav>
      </PageHero>

      {grouped.map(({ cluster, projects, programs: clusterPrograms }, index) => (
        <Section
          key={cluster.slug}
          id={cluster.slug}
          tone={index % 2 === 1 ? "tint" : "white"}
          className="scroll-mt-24"
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_0.55fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-azure-700">
                Programme area
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
                {cluster.title}
              </h2>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-navy-600">
                {cluster.lead}
              </p>

              {clusterPrograms.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {clusterPrograms.map((program) => (
                    <li key={program!.id}>
                      <Link
                        href={`/programs/${program!.slug}`}
                        className="inline-flex rounded-full bg-azure-50 px-3.5 py-1.5 text-sm font-bold text-azure-800 ring-1 ring-inset ring-azure-200 transition-colors hover:bg-azure-100"
                      >
                        {program!.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ImageRotator
              images={deal(index + 2, 0, 5)}
              alt={`${cluster.title} in the field`}
              offset={index + 1}
              className="aspect-16/10 rounded-card shadow-card lg:aspect-4/3"
              sizes="(min-width: 1024px) 30vw, 100vw"
            />
          </div>

          {projects.length > 0 && (
            <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <Reveal key={project.id} delay={(i % 3) * 90}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          )}
        </Section>
      ))}

      {unclustered.length > 0 && (
        <Section tone="tint">
          <SectionHeading
            title="Other projects"
            lead="Work whose programme area has not yet been assigned."
          />
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {unclustered.map((project, i) => (
              <Reveal key={project.id} delay={(i % 3) * 90}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {all.items.length === 0 && (
        <Section>
          <EmptyState
            title="No projects published yet"
            description="Projects are published from the admin area. Once they are, they appear here grouped by programme area."
            action={
              <ButtonLink href="/programs" variant="outline">
                See our programmes
              </ButtonLink>
            }
          />
        </Section>
      )}
    </>
  );
}
