import type { Metadata } from "next";

import { AdminBody, AdminHeader, DataTable, NotConnected } from "@/components/admin/shell";
import { STATUS_OPTIONS, StatusSelect } from "@/components/admin/status-select";
import { updateApplicationStatusAction } from "@/app/actions/admin";
import { Pagination } from "@/components/ui/pagination";
import { requireAnyPermission } from "@/lib/auth/dal";
import { listApplications } from "@/lib/repos/admin";
import { parsePage } from "@/lib/pagination";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Job applications" };
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const user = await requireAnyPermission("applications:view");
  const canManage = user.permissions.includes("applications:manage");

  const params = await searchParams;
  const page = parsePage(params.page);
  const result = await listApplications({ page, perPage: 25, status: params.status });

  return (
    <>
      <AdminHeader title={"Job applications"} description={"Shortlisting happens after the closing date, against the published criteria, by at least two people."} />
      <AdminBody className="space-y-6">
        {result.total === 0 ? (
          <NotConnected what={"Job applications"} />
        ) : (
          <>
            <DataTable headers={["Reference", "Candidate", "Vacancy", "Experience", "Status", "Applied"]} caption={"Job applications"}>
              {result.items.map((row) => (
                <tr key={row.id} className="hover:bg-navy-50/60">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-700">{row.reference}</td>
                  <td className="px-4 py-3 font-semibold text-navy-900">{row.name}<span className="block text-xs font-normal text-navy-500">{row.email}</span></td>
                  <td className="px-4 py-3 text-navy-700">{row.job_title ?? "—"}</td>
                  <td className="px-4 py-3 text-navy-600">{row.years_experience} yr{row.years_experience === 1 ? "" : "s"}</td>
                  <td className="px-4 py-3">
                    <StatusSelect
                      action={updateApplicationStatusAction}
                      id={row.id}
                      value={row.status}
                      options={[...STATUS_OPTIONS.application]}
                      disabled={!canManage}
                      disabledReason="You have read-only access here."
                    />
                  </td>
                  <td className="px-4 py-3 text-navy-500">{relativeTime(row.created_at)}</td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={result} basePath={"/admin/applications"} params={{ status: params.status }} label={"applications"} />
          </>
        )}
      </AdminBody>
    </>
  );
}
