import type { Metadata } from "next";
import Link from "next/link";
import { Info, MapPin } from "lucide-react";

import { AdminBody, AdminHeader, StatusPill } from "@/components/admin/shell";
import { ProjectFields } from "@/components/admin/project-fields";
import { Pagination } from "@/components/ui/pagination";
import { requirePermission } from "@/lib/auth/dal";
import { listProjects } from "@/lib/repos/content";
import { parsePage } from "@/lib/pagination";
import { formatMoney, percent } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requirePermission("content:edit");
  const canEdit = user.permissions.includes("content:edit");

  const page = parsePage((await searchParams).page);
  const result = await listProjects({ page, perPage: 10 });

  const missingFunder = result.items.filter((p) => !p.funder).length;

  return (
    <>
      <AdminHeader
        title="Projects"
        description="Funders, commitments and reach figures published on the public site. Everything here is entered by staff — nothing is hardcoded."
      />

      <AdminBody className="space-y-6">
        <div className="flex gap-3.5 rounded-card border-2 border-azure-200 bg-azure-50/60 p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-azure-700" aria-hidden="true" />
          <div className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">
            <p>
              <span className="font-bold text-navy-950">
                Name a funder only where they have agreed to be named,
              </span>{" "}
              and enter a commitment only where it matches a grant agreement or workplan. These
              appear on the homepage and the projects page, and they are exactly what a
              prospective funder or county health team will check.
            </p>
            <p className="mt-2">
              Anything left blank is omitted from the public site rather than filled with a
              placeholder. Every change is recorded in the audit log.
            </p>
            {missingFunder > 0 && (
              <p className="mt-2 font-bold text-navy-950">
                {missingFunder} of {result.items.length} projects on this page have no funder
                recorded.
              </p>
            )}
          </div>
        </div>

        <ul className="space-y-5">
          {result.items.map((project) => {
            const funded = percent(project.raised_cents, project.budget_cents);
            return (
              <li
                key={project.id}
                className="overflow-hidden rounded-card border-2 border-navy-100 bg-white shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-navy-100 bg-navy-50/50 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-navy-950">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="hover:text-azure-700 hover:underline"
                      >
                        {project.title}
                      </Link>
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-navy-600">
                      <MapPin className="size-3.5 text-azure-600" aria-hidden="true" />
                      {project.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-navy-700">
                      {funded}%{" "}
                      <span className="font-medium text-navy-500">
                        of {formatMoney(project.budget_cents, "KES", { compact: true })}
                      </span>
                    </span>
                    <StatusPill status={project.status} />
                  </div>
                </div>

                <div className="p-6">
                  <ProjectFields project={project} disabled={!canEdit} />
                </div>
              </li>
            );
          })}
        </ul>

        <Pagination page={result} basePath="/admin/projects" label="projects" />
      </AdminBody>
    </>
  );
}
