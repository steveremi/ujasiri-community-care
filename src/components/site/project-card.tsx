import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { ImageRotator } from "@/components/media/image-rotator";
import { MediaSlot } from "@/components/media/media-slot";
import { CARDS, deal } from "@/lib/gallery";
import { Badge } from "@/components/ui/primitives";
import type { Project } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const statusTone = {
  active: "green",
  planned: "neutral",
  completed: "azure",
} as const;

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border-2 border-navy-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
      {project.cover_image ? (
        <MediaSlot
          src={project.cover_image}
          alt={`${project.title} in ${project.location}`}
          ratio="video"
          rounded={false}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          imageClassName="transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
      ) : (
        <ImageRotator
          images={deal(project.id, 2, 5, CARDS)}
          alt={`${project.title} in ${project.location}`}
          offset={project.id % 6}
          className="aspect-video"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone={statusTone[project.status]}>{project.status}</Badge>
          <span className="flex items-center gap-1 text-[0.8125rem] font-semibold text-navy-500">
            <MapPin className="size-3.5" aria-hidden="true" />
            {project.location}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-extrabold leading-snug text-navy-950">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>

        <p className="mt-2.5 flex-1 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
          {project.summary}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-navy-100 pt-4 text-sm">
          {project.beneficiaries > 0 ? (
            <p className="font-bold text-navy-950">
              {formatNumber(project.beneficiaries)}{" "}
              <span className="font-semibold text-navy-500">reached</span>
            </p>
          ) : (
            <p className="font-semibold text-navy-500">{project.region}</p>
          )}

          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-600 transition-all duration-300 group-hover:bg-azure-500 group-hover:text-white"
          >
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
