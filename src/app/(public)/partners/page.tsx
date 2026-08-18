import type { Metadata } from "next";

import { PageHero } from "@/components/site/page-hero";
import { PartnerMark } from "@/components/site/partner-logo";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { listPartners } from "@/lib/repos/content";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Partners & referrals",
  description:
    "The health facilities, county governments, national programmes and NGOs Ujasiri Community Care refers people to — published so communities can verify them.",
  alternates: { canonical: "/partners" },
};

const tiers = [
  {
    key: "implementing" as const,
    title: "Government & health facilities",
    lead: "Where clinical care actually happens. We hold standing referral agreements with each of these, which means a person we send is expected on arrival.",
  },
  {
    key: "partner" as const,
    title: "Partner organisations",
    lead: "Services we refer into that we do not provide ourselves — legal aid, specialist care, and technical support.",
  },
  {
    key: "funder" as const,
    title: "Funders",
    lead: "Who pays for the work. Published because you are entitled to know who funds an organisation before you trust what it tells you.",
  },
];

export default async function PartnersPage() {
  const partners = await listPartners();

  return (
    <>
      <PageHero
        title="Who we work with, and who we refer you to"
        lead="We are not a clinic. Every programme we run ends at somebody else's door, so you are entitled to know whose — and to check that the door is real."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Partners", href: "/partners" },
        ]}
      />

      {tiers.map((tier, index) => {
        const items = partners.filter((p) => p.tier === tier.key);
        if (items.length === 0) return null;

        return (
          <Section key={tier.key} tone={index % 2 === 1 ? "tint" : "white"}>
            <SectionHeading title={tier.title} lead={tier.lead} />
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((partner) => (
                <li
                  key={partner.id}
                  className="rounded-card border-2 border-navy-100 bg-white p-6"
                >
                  <div className="flex items-start gap-4">
                    <PartnerMark partner={partner} />
                    <h3 className="text-lg font-extrabold leading-snug text-navy-950">
                      {partner.name}
                    </h3>
                  </div>
                  <p className="mt-4 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                    {partner.blurb}
                  </p>
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-4 inline-block text-sm font-bold text-azure-700 underline-offset-4 hover:underline"
                    >
                      Visit website →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      <Section tone="tint">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            align="center"
            title="Want to become a referral partner?"
            lead="If you run a service our clients need — or you have capacity that is going unused — we can probably fill it. We are equally interested in partners who will tell us when we are getting something wrong."
          />
          <p className="mt-8 text-center text-[0.9375rem] font-medium text-navy-600">
            Email{" "}
            <a
              href={`mailto:${site.contact.email}`}
              className="font-bold text-azure-700 underline underline-offset-4"
            >
              {site.contact.email}
            </a>
          </p>
        </div>
      </Section>
    </>
  );
}
