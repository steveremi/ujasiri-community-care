import type { Metadata } from "next";

import { AdminBody, AdminHeader, DataTable, NotConnected } from "@/components/admin/shell";
import { ActiveToggle, RoleSelect } from "@/components/admin/user-controls";
import { Pagination } from "@/components/ui/pagination";
import { requirePermission } from "@/lib/auth/dal";
import { listRoles, listUsers } from "@/lib/repos/admin";
import { parsePage } from "@/lib/pagination";
import { initials, relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "People" };
export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const actor = await requirePermission("users:view");

  const params = await searchParams;
  const page = parsePage(params.page);
  const [result, roles] = await Promise.all([
    listUsers({ page, perPage: 25, search: params.q }),
    listRoles(),
  ]);

  // Offer only roles the actor actually outranks. The server re-checks this on
  // submit — filtering here is convenience, not a control.
  const assignable = roles
    .filter((r) => r.rank < (actor.role_rank ?? 0))
    .map((r) => ({ id: r.id, label: r.label }));

  const canAssign = actor.permissions.includes("users:assign_roles");
  const canEdit = actor.permissions.includes("users:edit");

  return (
    <>
      <AdminHeader
        title="People"
        description="Everyone with an account — staff, volunteers and supporters. Roles decide what each of them can reach."
      />

      <AdminBody className="space-y-6">
        {result.total === 0 ? (
          <NotConnected what="User accounts" />
        ) : (
          <>
            <DataTable
              headers={["Name", "Email", "Role", "Status", "Last signed in"]}
              caption="User accounts"
            >
              {result.items.map((user) => {
                // A user may only be edited by someone who outranks them.
                const outranked = (actor.role_rank ?? 0) > (user.role_rank ?? 0);
                return (
                  <tr key={user.id} className="hover:bg-navy-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
                          {initials(user.name || user.email)}
                        </span>
                        <span className="font-semibold text-navy-900">
                          {user.name || "—"}
                          {user.id === actor.id && (
                            <span className="ml-2 text-xs font-normal text-navy-500">(you)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-navy-700">{user.email}</td>
                    <td className="px-4 py-3">
                      <RoleSelect
                        userId={user.id}
                        roleId={user.role_id}
                        roles={
                          assignable.length
                            ? assignable
                            : [{ id: user.role_id, label: user.role_label ?? "Member" }]
                        }
                        locked={!canAssign || !outranked}
                        lockReason="You cannot change a role at or above your own rank."
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ActiveToggle
                        userId={user.id}
                        active={user.is_active}
                        locked={!canEdit || !outranked || user.id === actor.id}
                        lockReason={
                          user.id === actor.id
                            ? "You cannot deactivate your own account."
                            : "You cannot change an account at or above your own rank."
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-navy-500">
                      {user.last_login_at ? relativeTime(user.last_login_at) : "never"}
                    </td>
                  </tr>
                );
              })}
            </DataTable>

            <Pagination page={result} basePath="/admin/users" label="accounts" />
          </>
        )}

        <p className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-5 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
          <span className="font-bold text-navy-950">Why some rows are locked: </span>
          nobody can assign or change a role at or above their own rank. That single rule is what
          stops an administrator quietly promoting themselves to Super Admin.
        </p>
      </AdminBody>
    </>
  );
}
