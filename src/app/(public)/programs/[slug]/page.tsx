import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ImageRotator } from "@/components/media/image-rotator";
import { deal } from "@/lib/gallery";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { PostCard } from "@/components/site/post-card";
import { ProjectCard } from "@/components/site/project-card";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { getProgram, listPosts, listPrograms, listProjects } from "@/lib/repos/content";
import { formatNumber } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const programs = await listPrograms();
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return { title: "Not found" };

  return {
    title: program.title,
    description: program.summary,
    alternates: { canonical: `/programs/${program.slug}` },
    openGraph: {
      title: program.title,
      description: program.summary,
      url: `/programs/${program.slug}`,
    },
  };
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  const [projects, posts] = await Promise.all([
    listProjects({ page: 1, perPage: 3, programId: program.id }),
    listPosts({ page: 1, perPage: 3, programId: program.id }),
  ]);

  const trail = [
    { name: "Home", href: "/" },
    { name: "Programmes", href: "/programs" },
    { name: program.title, href: `/programs/${program.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd trail={trail} />

      <PageHero
        title={program.title}
        lead={program.summary}
        breadcrumbs={trail}
        images={deal(program.id, 0, 6)}
        imageSeed={program.id % 6}
      >
        {program.people_reached > 0 && (
          <p className="text-sm font-bold text-azure-300">
            {formatNumber(program.people_reached)} people reached in the last financial year
          </p>
        )}
      </PageHero>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16 lg:py-20">
        <div className="prose-ucc max-w-none">
          {program.body.split("\n\n").map((block, i) => {
            const text = block.trim();
            if (!text) return null;
            if (text.startsWith("## ")) return <h2 key={i}>{text.slice(3)}</h2>;
            if (text.startsWith("### ")) return <h3 key={i}>{text.slice(4)}</h3>;
            return <p key={i}>{text}</p>;
          })}
        </div>

        <aside className="space-y-7">
          {/* Three rotating slots, each dealt a different slice of the pool so
              no two ever show the same frame. */}
          <div className="grid grid-cols-2 gap-3">
            <ImageRotator
              images={deal(program.id, 1, 6)}
              alt={`${program.title} in the field`}
              offset={program.id % 4}
              className="col-span-2 aspect-16/10 rounded-card shadow-card"
              sizes="(min-width: 1024px) 30vw, 100vw"
            />
            <ImageRotator
              images={deal(program.id, 2, 5)}
              alt="Community outreach"
              offset={(program.id + 2) % 5}
              className="aspect-square rounded-card shadow-card"
              sizes="(min-width: 1024px) 15vw, 45vw"
            />
            <ImageRotator
              images={deal(program.id, 3, 5)}
              alt="Staff and volunteers at work"
              offset={(program.id + 4) % 5}
              className="aspect-square rounded-card shadow-card"
              sizes="(min-width: 1024px) 15vw, 45vw"
            />
          </div>

          <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-6">
            <h2 className="text-lg font-extrabold text-navy-950">Need this service?</h2>
            <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
              It is free and confidential. We will tell you what is involved before anything
              happens, and nothing happens without your agreement.
            </p>
            <ButtonLink href="/get-help" size="md" className="mt-5 w-full">
              Find services near you
            </ButtonLink>
          </div>

          <div className="rounded-card bg-navy-950 p-6 text-white">
            <h2 className="text-lg font-extrabold">Fund this programme</h2>
            <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-white/75">
              Give directly to {program.title.toLowerCase()}, or leave it unrestricted so we can
              move it where it is needed most.
            </p>
            <ButtonLink href="/donate" size="md" className="mt-5 w-full">
              Donate
            </ButtonLink>
          </div>
        </aside>
      </div>

      {/* Full-width band. Breaks up a long read and gives the programme a
          second visual anchor before the project grid. */}
      <section className="border-y border-navy-100">
        <ImageRotator
          images={deal(program.id, 4, 6)}
          alt={`${program.title} across the counties we work in`}
          offset={(program.id + 1) % 8}
          interval={5600}
          overlay
          className="h-80 w-full sm:h-96 lg:h-[30rem]"
          sizes="100vw"
        />
      </section>

      {projects.items.length > 0 && (
        <Section tone="tint">
          <SectionHeading
            title="Projects in this programme"
            action={<ButtonLink href="/projects" size="sm" variant="outline">All projects</ButtonLink>}
          />
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {projects.items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Section>
      )}

      {posts.items.length > 0 && (
        <Section>
          <SectionHeading title="From this programme" />
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {posts.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
