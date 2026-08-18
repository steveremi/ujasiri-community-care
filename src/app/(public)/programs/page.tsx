import type { Metadata } from "next";

import { PageHero } from "@/components/site/page-hero";
import { ProgramCard } from "@/components/site/program-card";
import { ArrowLink, Section, SectionHeading } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { listPrograms } from "@/lib/repos/content";
import { formatNumber } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our programmes",
  description:
    "HIV prevention, TB screening, cancer awareness, gender-based violence response, and health services for adolescent girls and young women — delivered in the community and linked to facility care.",
  alternates: { canonical: "/programs" },
};

export default async function ProgramsPage() {
  const programs = await listPrograms();
  const totalReached = programs.reduce((sum, p) => sum + p.people_reached, 0);

  return (
    <>
      <PageHero
        title="Nine programmes, one pathway"
        lead="They overlap on purpose. The same household carries overlapping risk, so a person we meet for HIV testing is screened for TB, told about cervical screening, and — if she is a girl of thirteen — offered a route to HPV vaccination."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Programmes", href: "/programs" },
        ]}
      >
        {totalReached > 0 && (
          <p className="text-sm font-bold text-azure-300">
            {formatNumber(totalReached)} people reached across all programmes in the last
            financial year
          </p>
        )}
      </PageHero>

      <Section>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </Section>

      <Section tone="tint">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHeading
            title="We are not a clinic, and we do not pretend to be."
            lead="We do not diagnose, we do not treat, and we do not prescribe. What we do is find the people who are not reaching services, and get them through the right door with someone alongside them."
          />
          <div className="space-y-5">
            {[
              {
                title: "Clinical care happens at facilities",
                body: "Testing, screening and vaccination are delivered by qualified facility staff under their own protocols. We provide mobilisation, transport, logistics and follow-up.",
              },
              {
                title: "Referrals are agreements, not suggestions",
                body: "We hold standing referral agreements with named facilities, police gender desks and legal aid partners. A person we send is expected when they arrive.",
              },
              {
                title: "Government leads, we support",
                body: "HPV vaccination is a Ministry of Health service. TB diagnosis runs on national protocols. We work inside those systems rather than building a parallel one that collapses when funding ends.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-card border-2 border-navy-100 bg-white p-6">
                <h3 className="text-lg font-extrabold text-navy-950">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  {item.body}
                </p>
              </div>
            ))}
            <ArrowLink href="/partners">See who we refer to</ArrowLink>
          </div>
        </div>
      </Section>

      <Section tone="navy">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Support a programme
          </h2>
          <p className="mt-5 text-lg font-medium leading-relaxed text-white/70">
            You can give to whichever programme matters most to you — or leave it unrestricted so
            we can move it to whichever has the most urgent need.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/donate" size="lg">
              Donate
            </ButtonLink>
            <ButtonLink
              href="/projects"
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
            >
              See our projects
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
