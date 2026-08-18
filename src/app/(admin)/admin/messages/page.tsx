import type { Metadata } from "next";

import { AdminBody, AdminHeader, DataTable, NotConnected } from "@/components/admin/shell";
import { STATUS_OPTIONS, StatusSelect } from "@/components/admin/status-select";
import { updateMessageStatusAction } from "@/app/actions/admin";
import { Pagination } from "@/components/ui/pagination";
import { requireAnyPermission } from "@/lib/auth/dal";
import { listMessages } from "@/lib/repos/admin";
import { parsePage } from "@/lib/pagination";
import { relativeTime, truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const user = await requireAnyPermission("messages:view");
  const canManage = user.permissions.includes("messages:manage");

  const params = await searchParams;
  const page = parsePage(params.page);
  const result = await listMessages({ page, perPage: 25, status: params.status });

  return (
    <>
      <AdminHeader title={"Enquiries"} description={"Messages from the public contact form. We aim to reply within two working days."} />
      <AdminBody className="space-y-6">
        {result.total === 0 ? (
          <NotConnected what={"Enquiries"} />
        ) : (
          <>
            <DataTable headers={["From", "Topic", "Message", "Status", "Received"]} caption={"Enquiries"}>
              {result.items.map((row) => (
                <tr key={row.id} className="hover:bg-navy-50/60">
                  <td className="px-4 py-3 font-semibold text-navy-900">{row.name}<span className="block text-xs font-normal text-navy-500">{row.email}</span></td>
                  <td className="px-4 py-3 text-navy-700"><span className="capitalize">{row.topic}</span></td>
                  <td className="px-4 py-3 text-navy-600">{truncate(row.message, 70)}</td>
                  <td className="px-4 py-3">
                    <StatusSelect
                      action={updateMessageStatusAction}
                      id={row.id}
                      value={row.status}
                      options={[...STATUS_OPTIONS.message]}
                      disabled={!canManage}
                      disabledReason="You have read-only access here."
                    />
                  </td>
                  <td className="px-4 py-3 text-navy-500">{relativeTime(row.created_at)}</td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={result} basePath={"/admin/messages"} params={{ status: params.status }} label={"enquiries"} />
          </>
        )}
      </AdminBody>
    </>
  );
}
