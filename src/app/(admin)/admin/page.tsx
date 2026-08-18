import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AdminBody, AdminHeader, NotConnected, StatTile } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { getDashboardStats } from "@/lib/repos/admin";
import { formatMoney, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

// The dashboard reads live counts; caching it would show stale work queues.
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await requireUser();
  const stats = await getDashboardStats();

  const can = (p: string) => user.permissions.includes(p as never);

  /** Work queues, filtered to what this user can actually act on. */
  const queues = [
    {
      label: "Enquiries awaiting reply",
      value: stats.openMessages,
      href: "/admin/messages",
      show: can("messages:view"),
    },
    {
      label: "New volunteer applications",
      value: stats.newVolunteers,
      href: "/admin/volunteers",
      show: can("volunteers:view"),
    },
    {
      label: "Donations pending confirmation",
      value: stats.pendingDonations,
      href: "/admin/donations",
      show: can("donations:view"),
    },
    {
      label: "Drafts not yet published",
      value: stats.draftPosts,
      href: "/admin/posts",
      show: can("content:view"),
    },
  ].filter((q) => q.show);

  const totalOutstanding = queues.reduce((sum, q) => sum + q.value, 0);

  return (
    <>
      <AdminHeader
        title={`Karibu, ${user.name.split(" ")[0] || "there"}`}
        description={
          totalOutstanding > 0
            ? `${totalOutstanding} item${totalOutstanding === 1 ? "" : "s"} need your attention.`
            : "Nothing is waiting on you right now."
        }
        action={
          can("content:create") ? (
            <ButtonLink href="/admin/posts/new" size="sm">
              Write an update
            </ButtonLink>
          ) : undefined
        }
      />

      <AdminBody className="space-y-8">
        {!stats.live ? (
          <NotConnected what="The database" />
        ) : (
          <>
            {/* Work first, vanity metrics second. What an admin opens this page
                to find out is what is waiting for them. */}
            {queues.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-navy-900">Needs your attention</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {queues.map((queue) => (
                    <StatTile
                      key={queue.href}
                      label={queue.label}
                      value={formatNumber(queue.value)}
                      href={queue.href}
                      tone="attention"
                      hint={queue.value === 0 ? "All clear" : "Open the queue →"}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm font-semibold text-navy-900">This month</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {can("donations:view") && (
                  <>
                    <StatTile
                      label="Raised this month"
                      value={formatMoney(stats.donationsThisMonth.totalCents, "KES", {
                        compact: true,
                      })}
                      hint={`${stats.donationsThisMonth.count} completed gift${
                        stats.donationsThisMonth.count === 1 ? "" : "s"
                      }`}
                    />
                    <StatTile
                      label="Newsletter subscribers"
                      value={formatNumber(stats.subscribers)}
                      hint="Active, opted in"
                    />
                  </>
                )}
                {can("users:view") && (
                  <StatTile
                    label="Active accounts"
                    value={formatNumber(stats.totalUsers)}
                    hint="Staff, volunteers and supporters"
                    href="/admin/users"
                  />
                )}
                <StatTile
                  label="Your role"
                  value={user.role_label ?? "Member"}
                  hint={`${user.permissions.length} permission${
                    user.permissions.length === 1 ? "" : "s"
                  } granted`}
                />
              </div>
            </section>
          </>
        )}

        {/* A standing reminder rather than a one-time notice: on a system
            holding HIV, TB and GBV client information, this is the thing most
            worth repeating to whoever is signed in. */}
        <section className="rounded-card border border-azure-200 bg-azure-50/60 p-6">
          <h2 className="text-lg font-extrabold text-navy-950">
            Before you publish anything
          </h2>
          <ul className="mt-3 space-y-2 text-[0.9375rem] leading-relaxed text-navy-700">
            <li>
              Never publish a client&apos;s name, photograph or any detail that could identify
              them, without written informed consent on file.
            </li>
            <li>
              De-identify by default. In HIV, TB and GBV work, being recognised can cost someone
              their job, their family or their safety.
            </li>
            <li>
              Consent to one use is not consent to all uses. A photograph agreed for a report is
              not agreed for social media.
            </li>
          </ul>
          <Link
            href="/governance#safeguarding"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-azure-700 underline-offset-4 hover:underline"
          >
            Read the safeguarding policy
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </section>
      </AdminBody>
    </>
  );
}
