import type { Metadata } from "next";

import { AdminBody, AdminHeader, DataTable, NotConnected } from "@/components/admin/shell";
import { Pagination } from "@/components/ui/pagination";
import { requireAnyPermission } from "@/lib/auth/dal";
import { listAuditLog } from "@/lib/repos/admin";
import { parsePage } from "@/lib/pagination";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Audit log" };
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAnyPermission("audit:view");

  const params = await searchParams;
  const page = parsePage(params.page);
  const result = await listAuditLog({ page, perPage: 25, action: params.status });

  return (
    <>
      <AdminHeader title={"Audit log"} description={"Every privileged action, recorded. Auditability is not optional for an organisation that publishes its finances."} />
      <AdminBody className="space-y-6">
        {result.total === 0 ? (
          <NotConnected what={"Audit log"} />
        ) : (
          <>
            <DataTable headers={["Action", "Actor", "Entity", "IP", "When"]} caption={"Audit log"}>
              {result.items.map((row) => (
                <tr key={row.id} className="hover:bg-navy-50/60">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-800">{row.action}</td>
                  <td className="px-4 py-3 text-navy-700">{row.actor_email || "system"}</td>
                  <td className="px-4 py-3 text-navy-600">{row.entity}{row.entity_id && <span className="text-navy-400"> #{row.entity_id}</span>}</td>
                  <td className="px-4 py-3 font-mono text-xs text-navy-500">{row.ip ?? "—"}</td>
                  <td className="px-4 py-3 text-navy-500">{relativeTime(row.created_at)}</td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={result} basePath={"/admin/audit"} params={{ status: params.status }} label={"entries"} />
          </>
        )}
      </AdminBody>
    </>
  );
}
