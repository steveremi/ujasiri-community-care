import type { Metadata } from "next";

import { AdminBody, AdminHeader, DataTable, NotConnected } from "@/components/admin/shell";
import { STATUS_OPTIONS, StatusSelect } from "@/components/admin/status-select";
import { updateDonationStatusAction } from "@/app/actions/admin";
import { Pagination } from "@/components/ui/pagination";
import { requireAnyPermission } from "@/lib/auth/dal";
import { listDonations } from "@/lib/repos/admin";
import { parsePage } from "@/lib/pagination";
import { formatMoney, relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Donations" };
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const user = await requireAnyPermission("donations:view");
  const canManage = user.permissions.includes("donations:manage");

  const params = await searchParams;
  const page = parsePage(params.page);
  const result = await listDonations({ page, perPage: 25, status: params.status });

  return (
    <>
      <AdminHeader title={"Donations"} description={"Every recorded gift, including the ones that never completed."} />
      <AdminBody className="space-y-6">
        {result.total === 0 ? (
          <NotConnected what={"Donations"} />
        ) : (
          <>
            <DataTable headers={["Reference", "Donor", "Amount", "Method", "Status", "Received"]} caption={"Donations"}>
              {result.items.map((row) => (
                <tr key={row.id} className="hover:bg-navy-50/60">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-700">{row.reference}</td>
                  <td className="px-4 py-3 font-semibold text-navy-900">{row.is_anonymous ? <span className="text-navy-500">Anonymous</span> : (row.donor_name || row.donor_email)}</td>
                  <td className="px-4 py-3 font-bold text-navy-950">{formatMoney(row.amount_cents, row.currency)}</td>
                  <td className="px-4 py-3 text-navy-700"><span className="capitalize">{row.method}</span>{row.frequency === "monthly" && <span className="ml-1.5 text-xs text-azure-700">monthly</span>}</td>
                  <td className="px-4 py-3">
                    <StatusSelect
                      action={updateDonationStatusAction}
                      id={row.id}
                      value={row.status}
                      options={[...STATUS_OPTIONS.donation]}
                      disabled={!canManage}
                      disabledReason="You have read-only access here."
                    />
                  </td>
                  <td className="px-4 py-3 text-navy-500">{relativeTime(row.created_at)}</td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={result} basePath={"/admin/donations"} params={{ status: params.status }} label={"donations"} />
          </>
        )}
      </AdminBody>
    </>
  );
}
