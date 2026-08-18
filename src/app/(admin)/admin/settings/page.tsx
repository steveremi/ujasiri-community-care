import type { Metadata } from "next";
import { Check, Circle } from "lucide-react";

import { AdminBody, AdminHeader } from "@/components/admin/shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { requirePermission } from "@/lib/auth/dal";
import { getSettings } from "@/lib/repos/settings";
import { setupStatus } from "@/lib/env";
import { PROVIDERS, isProviderLive } from "@/lib/payments/providers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requirePermission("settings:view");
  const canEdit = user.permissions.includes("settings:manage");

  const [settings, services] = await Promise.all([
    getSettings(),
    Promise.resolve(setupStatus()),
  ]);
  const providers = PROVIDERS.map((p) => ({ ...p, live: isProviderLive(p) }));

  return (
    <>
      <AdminHeader
        title="Settings"
        description="Organisation details, edited here and published across the whole site — the header, the footer, every contact route, the structured data and the sitemap."
      />

      <AdminBody className="space-y-8">
        {canEdit ? (
          <SettingsForm settings={settings} />
        ) : (
          <section className="rounded-card border-2 border-navy-100 bg-white p-6 shadow-card">
            <h2 className="text-lg font-extrabold text-navy-950">Organisation</h2>
            <p className="mt-1 text-[0.8125rem] font-medium text-navy-500">
              Read-only — editing these requires{" "}
              <code className="font-mono text-xs">settings:manage</code>.
            </p>
            <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                ["Legal name", settings.legalName],
                ["Registration", `${settings.registration.number} (${settings.registration.authority})`],
                ["Tax exemption", settings.registration.taxNumber],
                ["Public email", settings.contact.email],
                ["Customer care", settings.customerCare.lines.join(", ")],
                ["Hotline", settings.help.lines.map((l) => l.number).join(", ")],
                ["Safeguarding", settings.contact.safeguardingEmail],
                ["Address", `${settings.contact.address.locality}, ${settings.contact.address.postalCode}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold uppercase tracking-wider text-navy-500">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-navy-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="rounded-card border-2 border-navy-100 bg-white p-6 shadow-card">
          <h2 className="text-lg font-extrabold text-navy-950">Connected services</h2>
          <ul className="mt-5 space-y-3.5">
            {services.map((service) => (
              <li key={service.key} className="flex gap-3">
                <span
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                    service.ready ? "bg-azure-600 text-white" : "bg-navy-100 text-navy-400",
                  )}
                >
                  {service.ready ? (
                    <Check className="size-3" aria-hidden="true" />
                  ) : (
                    <Circle className="size-2 fill-current" aria-hidden="true" />
                  )}
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-bold text-navy-900">
                    {service.label}
                  </span>
                  <span className="block text-[0.8125rem] font-medium text-navy-600">
                    {service.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card border-2 border-navy-100 bg-white p-6 shadow-card">
          <h2 className="text-lg font-extrabold text-navy-950">Payment providers</h2>
          <p className="mt-1 text-[0.8125rem] font-medium text-navy-500">
            A provider appears on the donate page whether or not it is connected. If it is not,
            the gift is recorded and the donor is told we will contact them — never dropped.
          </p>
          <ul className="mt-5 space-y-4">
            {providers.map((provider) => (
              <li
                key={provider.id}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-navy-50 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-[0.9375rem] font-bold text-navy-900">{provider.name}</p>
                  <p className="text-[0.8125rem] font-medium text-navy-600">{provider.feeNote}</p>
                  {!provider.live && (
                    <p className="mt-1 font-mono text-xs text-navy-500">
                      Needs: {provider.requiredEnv.join(", ")}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
                    provider.live
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-navy-50 text-navy-500 ring-navy-200",
                  )}
                >
                  {provider.live ? "Connected" : "Not connected"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </AdminBody>
    </>
  );
}
