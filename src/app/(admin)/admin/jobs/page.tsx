import type { Metadata } from "next";
import Link from "next/link";

import { AdminBody, AdminHeader, DataTable, NotConnected } from "@/components/admin/shell";
import { STATUS_OPTIONS, StatusSelect } from "@/components/admin/status-select";
import { updateJobStatusAction } from "@/app/actions/admin";
import { Pagination } from "@/components/ui/pagination";
import { requirePermission } from "@/lib/auth/dal";
import { listAllJobs } from "@/lib/repos/admin";
import { EMPLOYMENT_LABELS } from "@/lib/repos/jobs";
import { parsePage } from "@/lib/pagination";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Vacancies" };
export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const user = await requirePermission("jobs:view");
  const canManage = user.permissions.includes("jobs:manage");

  const params = await searchParams;
  const page = parsePage(params.page);
  const result = await listAllJobs({ page, perPage: 25, status: params.status });

  return (
    <>
      <AdminHeader
        title="Vacancies"
        description="Every role is advertised openly. Adverts close on their date and come down automatically — we do not leave them up to collect CVs."
      />

      <AdminBody className="space-y-6">
        {result.total === 0 ? (
          <NotConnected what="Vacancies" />
        ) : (
          <>
            <DataTable
              headers={["Title", "Department", "Type", "Closes", "Applications", "Status"]}
              caption="Job vacancies"
            >
              {result.items.map((job) => (
                <tr key={job.id} className="hover:bg-navy-50/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/careers/${job.slug}`}
                      className="font-semibold text-navy-900 hover:text-azure-700 hover:underline"
                    >
                      {job.title}
                    </Link>
                    <span className="block text-xs text-navy-500">{job.location}</span>
                  </td>
                  <td className="px-4 py-3 text-navy-700">{job.department}</td>
                  <td className="px-4 py-3 text-navy-700">
                    {EMPLOYMENT_LABELS[job.employment_type]}
                  </td>
                  <td className="px-4 py-3 text-navy-600">
                    {job.closes_on ? formatDate(job.closes_on) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/applications?job=${job.id}`}
                      className="font-bold text-azure-700 hover:underline"
                    >
                      {job.application_count ?? 0}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect
                      action={updateJobStatusAction}
                      id={job.id}
                      value={job.status}
                      options={[...STATUS_OPTIONS.job]}
                      disabled={!canManage}
                      disabledReason="You have read-only access here."
                    />
                  </td>
                </tr>
              ))}
            </DataTable>

            <Pagination
              page={result}
              basePath="/admin/jobs"
              params={{ status: params.status }}
              label="vacancies"
            />
          </>
        )}
      </AdminBody>
    </>
  );
}
