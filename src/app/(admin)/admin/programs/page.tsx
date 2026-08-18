import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";

import { AdminBody, AdminHeader, DataTable, StatusPill } from "@/components/admin/shell";
import { ReachInput } from "@/components/admin/reach-input";
import { requirePermission } from "@/lib/auth/dal";
import { listPrograms } from "@/lib/repos/content";

export const metadata: Metadata = { title: "Programmes" };
export const dynamic = "force-dynamic";

export default async function ProgramsAdminPage() {
  const user = await requirePermission("content:edit");
  const programs = await listPrograms();
  const canEdit = user.permissions.includes("content:edit");

  const unset = programs.filter((p) => p.people_reached === 0).length;

  return (
    <>
      <AdminHeader
        title="Programmes"
        description="The programme areas that anchor projects, updates and the public site. Reach figures entered here are published — everywhere they appear comes from this table."
      />

      <AdminBody className="space-y-6">
        <div className="flex gap-3.5 rounded-card border-2 border-azure-200 bg-azure-50/60 p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-azure-700" aria-hidden="true" />
          <div className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">
            <p>
              <span className="font-bold text-navy-950">
                Only publish a figure you can evidence.
              </span>{" "}
              These numbers appear on the homepage, the programme pages and the impact page. A
              funder or county health team who asks where one came from should get an answer from
              your M&amp;E data or your audit.
            </p>
            <p className="mt-2">
              Leave a figure blank and nothing is claimed for that programme — the public site
              simply omits it. Every change is recorded in the audit log with who made it and what
              it was before.
            </p>
            {unset > 0 && (
              <p className="mt-2 font-bold text-navy-950">
                {unset} of {programs.length} programmes have no figure recorded.
              </p>
            )}
          </div>
        </div>

        <DataTable
          headers={["Programme", "People reached", "Order", "Status"]}
          caption="Programmes"
        >
          {programs.map((program) => (
            <tr key={program.id} className="hover:bg-navy-50/60">
              <td className="px-4 py-3">
                <Link
                  href={`/programs/${program.slug}`}
                  className="font-semibold text-navy-900 hover:text-azure-700 hover:underline"
                >
                  {program.title}
                </Link>
                <span className="block font-mono text-xs text-navy-400">{program.slug}</span>
              </td>
              <td className="px-4 py-3">
                <ReachInput
                  id={program.id}
                  value={program.people_reached}
                  disabled={!canEdit}
                />
              </td>
              <td className="px-4 py-3 text-navy-500">{program.sort_order}</td>
              <td className="px-4 py-3">
                <StatusPill status={program.status} />
              </td>
            </tr>
          ))}
        </DataTable>
      </AdminBody>
    </>
  );
}
