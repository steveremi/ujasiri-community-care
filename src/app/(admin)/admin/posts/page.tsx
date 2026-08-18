import type { Metadata } from "next";
import Link from "next/link";

import { AdminBody, AdminHeader, DataTable, NotConnected } from "@/components/admin/shell";
import { STATUS_OPTIONS, StatusSelect } from "@/components/admin/status-select";
import { updatePostStatusAction } from "@/app/actions/admin";
import { Pagination } from "@/components/ui/pagination";
import { requirePermission } from "@/lib/auth/dal";
import { listAllPosts } from "@/lib/repos/admin";
import { parsePage } from "@/lib/pagination";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "News & stories" };
export const dynamic = "force-dynamic";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const user = await requirePermission("content:view");

  const params = await searchParams;
  const page = parsePage(params.page);

  // An Author may only edit their own work, so they only see their own drafts.
  const scopeToSelf =
    user.permissions.includes("content:edit_own") && !user.permissions.includes("content:edit");

  const result = await listAllPosts({
    page,
    perPage: 25,
    status: params.status,
    authorId: scopeToSelf ? user.id : undefined,
  });

  return (
    <>
      <AdminHeader
        title="News & stories"
        description={
          scopeToSelf
            ? "Your drafts and published pieces. Publishing is done by an editor."
            : "Everything written for the public site, published or not."
        }
      />
      <AdminBody className="space-y-6">
        {result.total === 0 ? (
          <NotConnected what="Content" />
        ) : (
          <>
            <DataTable headers={["Title", "Type", "Author", "Status", "Updated"]} caption="Posts">
              {result.items.map((post) => (
                <tr key={post.id} className="hover:bg-navy-50/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/news/${post.slug}`}
                      className="font-semibold text-navy-900 hover:text-azure-700 hover:underline"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-navy-700">{post.kind}</td>
                  <td className="px-4 py-3 text-navy-600">{post.author_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusSelect
                      action={updatePostStatusAction}
                      id={post.id}
                      value={post.status}
                      // An Author sees Draft and Archived; publishing is an
                      // editor's decision, and the server enforces that too.
                      options={
                        scopeToSelf
                          ? STATUS_OPTIONS.post.filter((o) => o.value !== "published")
                          : [...STATUS_OPTIONS.post]
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-navy-500">
                    {relativeTime(post.published_at ?? undefined)}
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={result} basePath="/admin/posts" label="items" />
          </>
        )}
      </AdminBody>
    </>
  );
}
