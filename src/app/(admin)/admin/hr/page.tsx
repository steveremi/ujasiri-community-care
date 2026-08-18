import type { Metadata } from "next";
import { Lock } from "lucide-react";

import { AdminBody, AdminHeader, DataTable, NotConnected } from "@/components/admin/shell";
import { STATUS_OPTIONS, StatusSelect } from "@/components/admin/status-select";
import { updateHrRequestAction } from "@/app/actions/admin";
import { HrRequestForm } from "@/components/admin/hr-request-form";
import { Pagination } from "@/components/ui/pagination";
import { canAny, requireUser } from "@/lib/auth/dal";
import { listHrRequests } from "@/lib/repos/admin";
import { parsePage } from "@/lib/pagination";
import { relativeTime, truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "HR requests" };
export const dynamic = "force-dynamic";

export default async function HrPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  // Any signed-in staff member may raise a request; only HR roles read them.
  const user = await requireUser();
  const canRead = await canAny("hr:view", "hr:manage");
  const canReadConfidential = user.permissions.includes("hr:manage");

  const params = await searchParams;
  const page = parsePage(params.page);

  const result = canRead
    ? await listHrRequests({
        page,
        perPage: 25,
        status: params.status,
        // Driven by permission, never by a query parameter.
        includeConfidential: canReadConfidential,
      })
    : null;

  return (
    <>
      <AdminHeader
        title="HR requests"
        description="Leave, references, payroll, equipment, policy questions and grievances. Grievances are routed confidentially, away from your own line manager."
      />

      <AdminBody className="space-y-8">
        <section className="rounded-card border-2 border-navy-100 bg-white p-6 shadow-card sm:p-7">
          <h2 className="text-xl font-extrabold text-navy-950">Raise a request</h2>
          <p className="mt-2 max-w-2xl text-[0.9375rem] font-medium leading-relaxed text-navy-600">
            HR responds within five working days. Anything marked confidential — and every
            grievance automatically — is visible only to staff with full HR rights.
          </p>
          <div className="mt-6 max-w-2xl">
            <HrRequestForm />
          </div>
        </section>

        {canRead && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-navy-950">Open requests</h2>
              {!canReadConfidential && (
                <span className="flex items-center gap-1.5 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-600">
                  <Lock className="size-3" aria-hidden="true" />
                  Confidential requests hidden
                </span>
              )}
            </div>

            {!result || result.total === 0 ? (
              <NotConnected what="HR requests" />
            ) : (
              <>
                <DataTable
                  headers={["Reference", "From", "Category", "Subject", "Status", "Raised"]}
                  caption="HR requests"
                >
                  {result.items.map((row) => (
                    <tr key={row.id} className="hover:bg-navy-50/60">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-700">
                        {row.reference}
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy-900">
                        {row.requester_name}
                        {row.confidential && (
                          <Lock
                            className="ml-1.5 inline size-3 text-azure-700"
                            aria-label="Confidential"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 capitalize text-navy-700">{row.category}</td>
                      <td className="px-4 py-3 text-navy-600">{truncate(row.subject, 50)}</td>
                      <td className="px-4 py-3">
                        <StatusSelect
                          action={updateHrRequestAction}
                          id={row.id}
                          value={row.status}
                          options={[...STATUS_OPTIONS.hr]}
                          disabled={!canReadConfidential}
                          disabledReason="Only staff with full HR rights can action requests."
                        />
                      </td>
                      <td className="px-4 py-3 text-navy-500">{relativeTime(row.created_at)}</td>
                    </tr>
                  ))}
                </DataTable>

                <Pagination
                  page={result}
                  basePath="/admin/hr"
                  params={{ status: params.status }}
                  label="requests"
                />
              </>
            )}
          </section>
        )}
      </AdminBody>
    </>
  );
}
