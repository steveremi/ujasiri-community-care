import type { Metadata } from "next";

import { MediaCluster, MediaSlot } from "@/components/media/media-slot";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLink, Section, SectionHeading } from "@/components/ui/primitives";
import { listImpactStats } from "@/lib/repos/content";
import { site } from "@/lib/site";
import { formatNumber } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About us",
  description:
    "Ujasiri Community Care is a Kenyan community health NGO working on HIV and TB prevention, cancer awareness, GBV response and adolescent girls' health since 2016.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Confidentiality is not a policy, it is the product",
    body: "In HIV, TB and GBV work, being identified can cost someone their job, their marriage or their safety. Everything else we do rests on people trusting that what they tell us stays with us.",
  },
  {
    title: "The person decides",
    body: "Testing, reporting, treatment, disclosure — every one of these is offered, explained, and can be declined. Declining changes nothing about how someone is treated.",
  },
  {
    title: "Report the outcome, not the activity",
    body: "How many people we tested is easy to count and tells you almost nothing. How many were still in care six months later is harder, and it is the number that matters.",
  },
  {
    title: "Publish the failures",
    body: "Our annual report has a section on what did not work. It is the section our board argues about most, and the reason anyone should believe the rest of it.",
  },
  {
    title: "Work inside the system",
    body: "HPV vaccination is a government service. TB diagnosis runs on national protocols. We strengthen those rather than building a parallel service that collapses when a grant ends.",
  },
];

export default async function AboutPage() {
  const stats = await listImpactStats();

  return (
    <>
      <PageHero
        title="Courage, carried together"
        lead={site.mission}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="prose-ucc max-w-none">
            <h2>Why we exist</h2>
            <p>
              The gap in community health is rarely the treatment. Kenya has antiretrovirals, TB
              drugs, cervical screening and an HPV vaccine — all of them free at public
              facilities, all of them effective.
            </p>
            <p>
              The gap is the distance between a person who needs one of those things and a clinic
              door they are afraid to walk through, cannot afford to reach, or does not know
              exists. That distance is measured in stigma, in bus fare, and in a day&apos;s lost
              wages.
            </p>
            <p>
              <strong>Ujasiri Community Care works in that gap.</strong> We find people who are
              not reaching services, we bring testing and screening to where they already are, and
              then we walk them to the door of the care that treats them.
            </p>

            <h2>How we started</h2>
            <p>
              UCC was founded in {site.founded} by Grace Wanjiku, after twelve years in community
              HIV programming, on a straightforward observation: the organisations reporting the
              biggest testing numbers were often the ones losing the most people afterwards.
            </p>
            <p>
              We began with one testing team and a rule we still keep — that nobody who tests
              positive leaves without someone going with them to a facility. Everything since has
              been an extension of that rule into TB, cancer screening, GBV response and
              adolescent girls&apos; health.
            </p>

            <h2>What we are not</h2>
            <p>
              We are not a clinic. We do not diagnose, treat or prescribe. Every clinical service
              associated with our name is delivered by qualified facility staff under their own
              protocols, and we publish who those partners are so a community can check them.
            </p>
          </div>

          <div className="space-y-8">
            <MediaCluster
              items={[
                { alt: "UCC outreach team at a community session", label: "Team in the field" },
                { alt: "A health worker preparing for a testing session", label: "Preparation detail" },
                { alt: "Community members at a health education session", label: "Community session" },
              ]}
            />

            <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-6">
              <h2 className="text-lg font-extrabold text-navy-950">In the last financial year</h2>
              <dl className="mt-5 space-y-4">
                {stats.map((stat) => (
                  <div key={stat.id} className="border-b border-azure-200 pb-4 last:border-0 last:pb-0">
                    <dt className="text-sm font-bold text-navy-700">{stat.label}</dt>
                    <dd className="mt-0.5 text-2xl font-extrabold tracking-tight text-navy-950">
                      {formatNumber(stat.value)}
                      {stat.suffix && <span className="text-azure-600">{stat.suffix}</span>}
                    </dd>
                    <dd className="mt-0.5 text-xs font-medium text-navy-500">{stat.note}</dd>
                  </div>
                ))}
              </dl>
              <ArrowLink href="/impact" className="mt-5">
                How we measure this
              </ArrowLink>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="tint">
        <SectionHeading
          title="What we hold to"
          lead="Five commitments that decide how we work when the answer is not obvious."
        />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, i) => (
            <li key={value.title} className="rounded-card border-2 border-navy-100 bg-white p-7">
              <span className="font-mono text-sm font-bold text-azure-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-extrabold leading-snug text-navy-950">
                {value.title}
              </h3>
              <p className="mt-2.5 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                {value.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <MediaSlot
            ratio="wide"
            alt="UCC staff and community members together"
            label="Wide team or community photograph"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div>
            <SectionHeading
              title="Meet the people behind it"
              lead="Most of our staff live in the counties where we work, and several came through the programmes themselves — which is the best qualification anyone here holds."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/team">Our team</ButtonLink>
              <ButtonLink href="/governance" variant="outline">
                Governance
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
