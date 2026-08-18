import type { Metadata } from "next";

import { MediaSlot } from "@/components/media/media-slot";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { listTeam } from "@/lib/repos/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our team",
  description:
    "The leadership and board of Ujasiri Community Care — the people running HIV, TB, cancer, GBV and adolescent girls' health programmes across Kenya.",
  alternates: { canonical: "/team" },
};

const groups = [
  {
    key: "leadership" as const,
    title: "Leadership",
    lead: "The people who run the programmes day to day and are accountable for what they deliver.",
  },
  {
    key: "board" as const,
    title: "Board of trustees",
    lead: "Unpaid, independent of management, and responsible for holding the organisation to account. Trustees serve four-year terms and are recruited openly.",
  },
];

export default async function TeamPage() {
  const team = await listTeam();

  return (
    <>
      <PageHero
        title="The people doing the work"
        lead="Most of our staff live in the counties where we work. Several came through the programmes themselves, which is the single best qualification anyone here holds."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Our team", href: "/team" },
        ]}
      />

      {groups.map((group, index) => {
        const members = team.filter((m) => m.group_name === group.key);
        if (members.length === 0) return null;

        return (
          <Section key={group.key} tone={index % 2 === 1 ? "tint" : "white"}>
            <SectionHeading title={group.title} lead={group.lead} />
            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <li key={member.id}>
                  <MediaSlot
                    src={member.photo_url}
                    alt={`${member.name}, ${member.role_title}`}
                    label={`Portrait — ${member.name}`}
                    ratio="portrait"
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  />
                  <h3 className="mt-5 text-lg font-extrabold text-navy-950">{member.name}</h3>
                  <p className="mt-0.5 text-sm font-bold text-azure-700">{member.role_title}</p>
                  <p className="mt-2.5 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                    {member.bio}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      <Section tone="tint">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            align="center"
            title="Everyone here is checked and trained"
            lead="Every member of staff, every volunteer and every trustee completes safeguarding training annually and undergoes a background check before working with clients. There are no exemptions, including for the board."
          />
        </div>
      </Section>
    </>
  );
}
