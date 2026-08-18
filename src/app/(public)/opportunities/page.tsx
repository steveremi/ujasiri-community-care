import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileText, Gavel, Handshake } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { listOpenJobs } from "@/lib/repos/jobs";
import { site } from "@/lib/site";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Tenders, prequalification, vacancies and partnership opportunities with Ujasiri Community Care.",
  alternates: { canonical: "/opportunities" },
};

const routes = [
  {
    Icon: Gavel,
    title: "Tenders & prequalification",
    body: "We advertise every tender openly and evaluate against published criteria. Suppliers are prequalified annually across goods, works and services.",
    action: { label: "Request the current list", href: "/contact" },
  },
  {
    Icon: Briefcase,
    title: "Vacancies",
    body: "Every role is advertised. We do not fill posts by word of mouth, and we do not keep dormant adverts up to collect CVs.",
    action: { label: "See open roles", href: "/careers" },
  },
  {
    Icon: Handshake,
    title: "Partnership",
    body: "Health facilities, county governments, national programmes and NGOs. We are most useful to people who have a service and need it reached.",
    action: { label: "Partner with us", href: "/get-involved/partner" },
  },
  {
    Icon: FileText,
    title: "Consultancies",
    body: "Evaluations, assessments and technical assignments are advertised here alongside tenders, with the same open process.",
    action: { label: "Get in touch", href: "/contact" },
  },
];

export default async function OpportunitiesPage() {
  const jobs = await listOpenJobs();

  return (
    <>
      <PageHero
        title="Opportunities"
        lead="Tenders, vacancies, consultancies and partnerships — all advertised openly, all evaluated against published criteria."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Opportunities", href: "/opportunities" },
        ]}
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2">
          {routes.map((route, i) => (
            <Reveal key={route.title} delay={i * 90}>
              <article className="group flex h-full flex-col rounded-card border-2 border-navy-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                <span className="grid size-12 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                  <route.Icon className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-extrabold tracking-tight text-navy-950">
                  {route.title}
                </h2>
                <p className="mt-3 flex-1 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  {route.body}
                </p>
                <Link
                  href={route.action.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-bold text-azure-700 underline-offset-4 hover:underline"
                >
                  {route.action.label}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="tint">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              title="How we procure"
              lead="The same rules on every tender, published so a supplier knows what they are walking into."
            />
            <ul className="mt-8 space-y-4">
              {[
                "Every tender is advertised openly. We do not invite a closed list.",
                "Evaluation is against the criteria published in the tender document, by a committee of at least three people.",
                "Anyone with a conflict of interest declares it and leaves the room for that decision.",
                "We do not procure from an organisation connected to a trustee or member of staff without an open competitive process and a recorded board decision.",
                "Unsuccessful bidders can request feedback, and will get it.",
              ].map((rule) => (
                <li key={rule} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-azure-500"
                  />
                  <span className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                    {rule}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border-2 border-navy-100 bg-white p-7">
            <h2 className="text-xl font-extrabold text-navy-950">
              {jobs.length > 0
                ? `${jobs.length} open ${jobs.length === 1 ? "vacancy" : "vacancies"}`
                : "No open vacancies right now"}
            </h2>
            <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
              {jobs.length > 0
                ? "Advertised roles across our programme, clinical and operations teams."
                : "We do not keep dormant adverts up. Check back, or send a speculative expression of interest."}
            </p>

            {jobs.length > 0 && (
              <ul className="mt-5 space-y-2.5">
                {jobs.slice(0, 5).map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/careers/${job.slug}`}
                      className="flex items-baseline justify-between gap-3 rounded-xl border border-navy-100 px-4 py-3 transition-colors hover:border-azure-300 hover:bg-azure-50/50"
                    >
                      <span className="font-bold text-navy-900">{job.title}</span>
                      <span className="shrink-0 text-xs font-semibold text-navy-500">
                        {job.location}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap gap-2.5">
              <ButtonLink href="/careers" size="md">
                All vacancies
              </ButtonLink>
              <ButtonLink href="/contact" size="md" variant="outline">
                Procurement enquiries
              </ButtonLink>
            </div>

            <p className="mt-5 border-t border-navy-100 pt-4 text-xs font-medium leading-relaxed text-navy-500">
              Suspect fraud in a tender or a recruitment? Report it confidentially to{" "}
              <a
                href={`mailto:${site.contact.safeguardingEmail}`}
                className="font-bold text-azure-700 underline underline-offset-4"
              >
                {site.contact.safeguardingEmail}
              </a>
              . It reaches our board, not our management. We never ask for payment at any stage of
              recruitment or procurement.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
