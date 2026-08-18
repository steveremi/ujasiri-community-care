import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { AdminSidebar } from "@/components/admin/sidebar";
import { SetupChecklist } from "@/components/admin/setup-checklist";
import { getCurrentUser } from "@/lib/auth/dal";
import { isAuthConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Ujasiri Admin" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin shell.
 *
 * Before Firebase is configured there is no way to sign anyone in, so rather
 * than bouncing to a login page that cannot work, this renders the setup
 * checklist. Once keys exist the DAL takes over and the real guard applies.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!isAuthConfigured) {
    return <SetupChecklist />;
  }

  // Not a security boundary — each page runs its own requirePermission. This
  // only decides what the shell renders.
  const user = await getCurrentUser();
  if (!user) return <SetupChecklist signInPrompt />;

  return (
    <div className="flex min-h-svh bg-navy-50/40">
      <AdminSidebar
        permissions={user.permissions}
        user={{
          name: user.name,
          email: user.email,
          roleLabel: user.role_label ?? "Member",
        }}
      />
      <div className="min-w-0 flex-1">{children}</div>
      {/* Toasts announce the outcome of inline table actions, which otherwise
          complete silently and leave the user unsure anything happened. */}
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{ className: "font-sans font-medium" }}
      />
    </div>
  );
}
