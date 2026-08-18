import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";

import { AdminBody, AdminHeader, NotConnected } from "@/components/admin/shell";
import { Badge } from "@/components/ui/primitives";
import { requirePermission } from "@/lib/auth/dal";
import { listRoles } from "@/lib/repos/admin";
import {
  GROUP_LABELS,
  PERMISSIONS,
  groupedPermissions,
  type Permission,
} from "@/lib/auth/rbac";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Roles & permissions" };
export const dynamic = "force-dynamic";

export default async function RolesPage() {
  await requirePermission("roles:view");

  const roles = await listRoles();
  const groups = groupedPermissions();

  return (
    <>
      <AdminHeader
        title="Roles & permissions"
        description="Permissions are the unit of authority; roles are named bundles of them. Every server-side check asks what a user may do, never what they are called."
      />

      <AdminBody className="space-y-8">
        {roles.length === 0 ? (
          <NotConnected what="Roles" />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-card border-2 border-navy-100 bg-white p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-extrabold text-navy-950">{role.label}</h2>
                    <Badge tone={role.rank >= 80 ? "navy" : "neutral"}>rank {role.rank}</Badge>
                  </div>
                  <p className="mt-2 text-[0.8125rem] font-medium leading-relaxed text-navy-600">
                    {role.description}
                  </p>
                  <p className="mt-4 border-t border-navy-100 pt-3 text-xs font-semibold text-navy-500">
                    {role.permissions?.length ?? 0} permissions ·{" "}
                    {role.user_count ?? 0} {role.user_count === 1 ? "person" : "people"}
                  </p>
                </div>
              ))}
            </div>

            {/* The matrix: the single most useful view of an RBAC system, and
                the one that makes a mistaken grant obvious at a glance. */}
            <div className="overflow-hidden rounded-card border-2 border-navy-100 bg-white shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[52rem] text-left text-sm">
                  <caption className="sr-only">Permission matrix by role</caption>
                  <thead>
                    <tr className="border-b-2 border-navy-100 bg-navy-50/60">
                      <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-navy-500">
                        Permission
                      </th>
                      {roles.map((role) => (
                        <th
                          key={role.id}
                          scope="col"
                          className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-navy-500"
                        >
                          {role.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-50">
                    {Object.entries(groups).map(([group, permissions]) => (
                      <>
                        <tr key={group} className="bg-navy-50/40">
                          <th
                            scope="colgroup"
                            colSpan={roles.length + 1}
                            className="px-4 py-2 text-left text-xs font-extrabold uppercase tracking-wider text-navy-700"
                          >
                            {GROUP_LABELS[group] ?? group}
                          </th>
                        </tr>
                        {permissions.map((permission) => (
                          <tr key={permission} className="hover:bg-navy-50/40">
                            <th scope="row" className="px-4 py-2.5 text-left font-normal">
                              <span className="block font-mono text-xs font-semibold text-navy-800">
                                {permission}
                              </span>
                              <span className="block text-xs text-navy-500">
                                {PERMISSIONS[permission as Permission]}
                              </span>
                            </th>
                            {roles.map((role) => {
                              const granted = role.permissions?.includes(permission) ?? false;
                              return (
                                <td key={role.id} className="px-3 py-2.5 text-center">
                                  <span className="sr-only">
                                    {granted ? "granted" : "not granted"}
                                  </span>
                                  {granted ? (
                                    <Check
                                      className="mx-auto size-4 text-azure-600"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <Minus
                                      className={cn("mx-auto size-4 text-navy-200")}
                                      aria-hidden="true"
                                    />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </AdminBody>
    </>
  );
}
