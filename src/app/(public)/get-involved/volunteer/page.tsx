import type { Metadata } from "next";
import { Clock, HeartHandshake, ShieldCheck, Users } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { VolunteerForm } from "@/components/site/volunteer-form";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { listPrograms } from "@/lib/repos/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Volunteer with us",
  description:
    "Volunteer with Ujasiri Community Care — community outreach, safe space mentoring, monitoring and administration across Kenya.",
  alternates: { canonical: "/get-involved/volunteer" },
};

const roles = [
  {
    Icon: Users,
    title: "Community outreach",
    body: "Support testing and screening days: mobilisation, registration, crowd flow, and making sure nobody waiting is forgotten.",
  },
  {
    Icon: HeartHandshake,
    title: "Safe space support",
    body: "Assist mentors running sessions for adolescent girls. Requires a background check and, for most people, some patience.",
  },
  {
    Icon: Clock,
    title: "Follow-up calling",
    body: "The unglamorous, essential work: calling clients at one week, one month and six months to check they are still in care.",
  },
  {
    Icon: ShieldCheck,
    title: "Data and administration",
    body: "Accurate, confidential record-keeping. If you are the sort of person who notices when a number does not add up, we need you.",
  },
];

export default async function VolunteerPage() {
  const programs = await listPrograms();

  return (
    <>
      <PageHero
        title="Volunteer with us"
        lead="We ask for at least six months. The communities we work in have had enough of people who appear for a fortnight and vanish."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Get involved", href: "/get-involved" },
          { name: "Volunteer", href: "/get-involved/volunteer" },
        ]}
      />

      <Section>
        <SectionHeading
          title="Where volunteers help most"
          lead="Intakes run twice a year. Every role carries the same checks and induction as paid staff."
        />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {roles.map(({ Icon, title, body }) => (
            <li key={title} className="rounded-card border-2 border-navy-100 bg-white p-7">
              <span className="grid size-11 place-items-center rounded-xl bg-azure-50 text-azure-700">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold text-navy-950">{title}</h3>
              <p className="mt-2.5 text-[0.9375rem] font-medium leading-relaxed text-navy-600">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="tint">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading title="Before you apply" />
            <ul className="mt-8 space-y-4">
              {[
                "A satisfactory background check is required for any role in contact with clients. No exceptions.",
                "Safeguarding induction is completed before your first day, not after it.",
                "Client confidentiality is absolute. Most of what you learn volunteering here is not yours to repeat, during or after.",
                "Some evening and weekend work. The people we most need to reach are not free during office hours.",
                "Volunteering is a genuine route into paid work here — several of our staff started this way.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-azure-500" aria-hidden="true" />
                  <span className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border-2 border-navy-100 bg-white p-7 shadow-card sm:p-9">
            <h2 className="text-2xl font-extrabold text-navy-950">Apply to volunteer</h2>
            <p className="mt-2 text-[0.9375rem] font-medium text-navy-600">
              Our volunteer coordinator responds within five working days.
            </p>
            <div className="mt-7">
              <VolunteerForm programs={programs} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
