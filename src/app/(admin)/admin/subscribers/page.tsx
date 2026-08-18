import type { Metadata } from "next";

import { AdminBody, AdminHeader, DataTable, NotConnected } from "@/components/admin/shell";
import { Pagination } from "@/components/ui/pagination";
import { requirePermission } from "@/lib/auth/dal";
import { listSubscribers } from "@/lib/repos/admin";
import { parsePage } from "@/lib/pagination";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Newsletter" };
export const dynamic = "force-dynamic";

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePermission("subscribers:view");

  const page = parsePage((await searchParams).page);
  const result = await listSubscribers({ page, perPage: 50 });

  return (
    <>
      <AdminHeader
        title="Newsletter subscribers"
        description="People who asked for our monthly update. Everyone here opted in, and every send must carry a working unsubscribe link."
      />

      <AdminBody className="space-y-6">
        {result.total === 0 ? (
          <NotConnected what="Subscribers" />
        ) : (
          <>
            <DataTable headers={["Email", "Name", "Source", "Status", "Subscribed"]} caption="Subscribers">
              {result.items.map((sub) => (
                <tr key={sub.id} className="hover:bg-navy-50/60">
                  <td className="px-4 py-3 font-semibold text-navy-900">{sub.email}</td>
                  <td className="px-4 py-3 text-navy-700">{sub.name || "—"}</td>
                  <td className="px-4 py-3 capitalize text-navy-600">{sub.source}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        sub.is_active
                          ? "text-xs font-bold text-emerald-700"
                          : "text-xs font-bold text-navy-400"
                      }
                    >
                      {sub.is_active ? "Subscribed" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy-500">{relativeTime(sub.created_at)}</td>
                </tr>
              ))}
            </DataTable>

            <Pagination page={result} basePath="/admin/subscribers" label="subscribers" />
          </>
        )}

        <p className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-5 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
          <span className="font-bold text-navy-950">Before you export this list: </span>
          these addresses were given to us for a monthly update about our work, and nothing else.
          Using them for anything a subscriber did not agree to — or sharing them with a partner
          organisation — is a breach of our privacy policy and of the Data Protection Act.
        </p>
      </AdminBody>
    </>
  );
}
