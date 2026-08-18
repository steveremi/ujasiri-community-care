import type { Metadata } from "next";

import { AdminBody, AdminHeader, DataTable, NotConnected } from "@/components/admin/shell";
import { STATUS_OPTIONS, StatusSelect } from "@/components/admin/status-select";
import { updateVolunteerStatusAction } from "@/app/actions/admin";
import { Pagination } from "@/components/ui/pagination";
import { requireAnyPermission } from "@/lib/auth/dal";
import { listVolunteerApplications } from "@/lib/repos/admin";
import { parsePage } from "@/lib/pagination";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Volunteer applications" };
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const user = await requireAnyPermission("volunteers:view");
  const canManage = user.permissions.includes("volunteers:manage");

  const params = await searchParams;
  const page = parsePage(params.page);
  const result = await listVolunteerApplications({ page, perPage: 25, status: params.status });

  return (
    <>
      <AdminHeader title={"Volunteer applications"} description={"Review, respond and track applications through to induction."} />
      <AdminBody className="space-y-6">
        {result.total === 0 ? (
          <NotConnected what={"Volunteer applications"} />
        ) : (
          <>
            <DataTable headers={["Name", "Email", "Availability", "Status", "Applied"]} caption={"Volunteer applications"}>
              {result.items.map((row) => (
                <tr key={row.id} className="hover:bg-navy-50/60">
                  <td className="px-4 py-3 font-semibold text-navy-900">{row.name}</td>
                  <td className="px-4 py-3"><a href={`mailto:${row.email}`} className="text-azure-700 hover:underline">{row.email}</a></td>
                  <td className="px-4 py-3 text-navy-600">{row.availability || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusSelect
                      action={updateVolunteerStatusAction}
                      id={row.id}
                      value={row.status}
                      options={[...STATUS_OPTIONS.volunteer]}
                      disabled={!canManage}
                      disabledReason="You have read-only access here."
                    />
                  </td>
                  <td className="px-4 py-3 text-navy-500">{relativeTime(row.created_at)}</td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={result} basePath={"/admin/volunteers"} params={{ status: params.status }} label={"applications"} />
          </>
        )}
      </AdminBody>
    </>
  );
}
