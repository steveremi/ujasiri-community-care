import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Consistent page header for every admin screen. */
export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="border-b border-navy-100 bg-white">
      <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-end sm:justify-between lg:px-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-950">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-navy-600">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}

export function AdminBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-6 py-8 lg:px-8", className)}>{children}</div>;
}

/** A dashboard metric tile. */
export function StatTile({
  label,
  value,
  hint,
  tone = "default",
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "attention";
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-[0.8125rem] font-medium text-navy-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-extrabold tracking-tight",
          tone === "attention" && Number(value) > 0 ? "text-azure-700" : "text-navy-950",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs leading-snug text-navy-500">{hint}</p>}
    </>
  );

  const base =
    "rounded-card border border-navy-100 bg-white p-5 shadow-card transition-shadow";

  if (href) {
    return (
      <a href={href} className={cn(base, "block hover:shadow-lift")}>
        {inner}
      </a>
    );
  }
  return <div className={base}>{inner}</div>;
}

/**
 * Shown when the database is unreachable. Deliberately never dressed up with
 * placeholder numbers — an admin screen that invents data is one someone acts
 * on.
 */
export function NotConnected({ what }: { what: string }) {
  return (
    <div className="rounded-card border border-dashed border-navy-200 bg-white px-6 py-14 text-center">
      <h2 className="text-lg font-extrabold text-navy-900">
        {what} is not connected yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-navy-600">
        Add your Supabase keys to{" "}
        <code className="rounded bg-navy-900/5 px-1.5 py-0.5 font-mono text-xs">.env.local</code>{" "}
        and run the migrations in{" "}
        <code className="rounded bg-navy-900/5 px-1.5 py-0.5 font-mono text-xs">
          supabase/migrations/
        </code>
        . Nothing is shown here rather than sample data, because sample data in an admin screen
        gets acted on.
      </p>
    </div>
  );
}

/** Table chrome shared by every admin listing. */
export function DataTable({
  headers,
  children,
  caption,
}: {
  headers: string[];
  children: ReactNode;
  caption?: string;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-navy-100 bg-white shadow-card">
      {/* The wrapper scrolls, not the page — a wide table must never make the
          whole document scroll sideways on a phone. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50/60">
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-navy-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusPill({
  status,
}: {
  status: string;
}) {
  const tones: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    draft: "bg-navy-50 text-navy-600 ring-navy-200",
    planned: "bg-navy-50 text-navy-600 ring-navy-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    new: "bg-azure-50 text-azure-700 ring-azure-200",
    reviewing: "bg-amber-50 text-amber-700 ring-amber-200",
    in_progress: "bg-amber-50 text-amber-700 ring-amber-200",
    failed: "bg-red-50 text-red-700 ring-red-200",
    declined: "bg-red-50 text-red-700 ring-red-200",
    refunded: "bg-red-50 text-red-700 ring-red-200",
    archived: "bg-navy-50 text-navy-500 ring-navy-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset",
        tones[status] ?? "bg-navy-50 text-navy-600 ring-navy-200",
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
