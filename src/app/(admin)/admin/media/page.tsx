import type { Metadata } from "next";
import { AlertTriangle, Check } from "lucide-react";

import { AdminBody, AdminHeader, NotConnected } from "@/components/admin/shell";
import { MediaSlot } from "@/components/media/media-slot";
import { Pagination } from "@/components/ui/pagination";
import { requirePermission } from "@/lib/auth/dal";
import { listMedia } from "@/lib/repos/admin";
import { parsePage } from "@/lib/pagination";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Media library" };
export const dynamic = "force-dynamic";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePermission("media:view");

  const page = parsePage((await searchParams).page);
  const result = await listMedia({ page, perPage: 24 });

  const missingConsent = result.items.filter((m) => !m.consent_on_file).length;

  return (
    <>
      <AdminHeader
        title="Media library"
        description="Photographs and documents, with the consent record attached to each one."
      />

      <AdminBody className="space-y-6">
        {/* Consent is the whole point of this screen. A photograph of an
            identifiable person published without it is the single most damaging
            mistake this organisation could make online. */}
        <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-950">
            <AlertTriangle className="size-5 text-azure-700" aria-hidden="true" />
            Consent before publication, every time
          </h2>
          <ul className="mt-3 space-y-2 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
            <li>
              Written informed consent is required before any identifiable person appears on the
              public site. No exceptions, and no verbal agreements.
            </li>
            <li>
              Consent to one use is not consent to all uses. A photograph agreed for an annual
              report is not agreed for social media.
            </li>
            <li>
              We work in HIV, TB and GBV. Publishing a recognisable face alongside that content
              can cost someone their job, their family or their safety — whether or not they are
              actually a client.
            </li>
            <li>
              Prefer hands, backs, wide shots and environment over faces. A photograph nobody can
              be identified from needs no consent and carries no risk.
            </li>
          </ul>
          {missingConsent > 0 && (
            <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-bold text-navy-900">
              {missingConsent} item{missingConsent === 1 ? " has" : "s have"} no consent recorded.
              Do not publish {missingConsent === 1 ? "it" : "them"} until that is resolved.
            </p>
          )}
        </div>

        {result.total === 0 ? (
          <NotConnected what="The media library" />
        ) : (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {result.items.map((item) => (
                <li
                  key={item.id}
                  className="overflow-hidden rounded-card border-2 border-navy-100 bg-white"
                >
                  <MediaSlot
                    src={item.url}
                    alt={item.alt || "Library item"}
                    ratio="square"
                    rounded={false}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                  <div className="p-4">
                    <p className="truncate text-sm font-bold text-navy-900" title={item.alt}>
                      {item.alt || <span className="text-red-600">No alt text</span>}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-navy-500">
                      {item.collection} · {formatDate(item.created_at)}
                    </p>
                    <p
                      className={
                        item.consent_on_file
                          ? "mt-2.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700"
                          : "mt-2.5 flex items-center gap-1.5 text-xs font-bold text-red-600"
                      }
                    >
                      {item.consent_on_file ? (
                        <>
                          <Check className="size-3.5" aria-hidden="true" />
                          Consent on file
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-3.5" aria-hidden="true" />
                          No consent recorded
                        </>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Pagination page={result} basePath="/admin/media" label="items" />
          </>
        )}
      </AdminBody>
    </>
  );
}
