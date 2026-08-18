import type { Metadata } from "next";

import { AdminBody, AdminHeader, DataTable, StatusPill } from "@/components/admin/shell";
import { requirePermission } from "@/lib/auth/dal";
import { listUpcomingEvents } from "@/lib/repos/content";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  await requirePermission("content:edit");
  const events = await listUpcomingEvents(50);

  return (
    <>
      <AdminHeader
        title="Events"
        description="Testing drives, screening days, community review meetings and awareness campaigns."
      />
      <AdminBody>
        <DataTable headers={["Event", "Venue", "Starts", "Capacity", "Status"]} caption="Events">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-navy-50/60">
              <td className="px-4 py-3 font-semibold text-navy-900">{event.title}</td>
              <td className="px-4 py-3 text-navy-700">
                {event.venue}
                <span className="block text-xs text-navy-500">{event.location}</span>
              </td>
              <td className="px-4 py-3 text-navy-600">{formatDateTime(event.starts_at)}</td>
              <td className="px-4 py-3 text-navy-600">
                {event.capacity > 0 ? event.capacity : "Open"}
              </td>
              <td className="px-4 py-3">
                <StatusPill status={event.status} />
              </td>
            </tr>
          ))}
        </DataTable>
      </AdminBody>
    </>
  );
}
