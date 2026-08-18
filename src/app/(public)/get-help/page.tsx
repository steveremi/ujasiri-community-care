import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, Phone, ShieldCheck } from "lucide-react";

import { FaqJsonLd } from "@/components/seo/json-ld";
import { AfterHoursLines } from "@/components/site/after-hours-lines";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { site } from "@/lib/site";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Get help",
  description:
    "Free, confidential HIV testing, TB screening, cancer screening and support after violence. Find services near you, or call the numbers that answer 24 hours a day.",
  alternates: { canonical: "/get-help" },
};

const services = [
  {
    href: "/get-help/gbv",
    title: "After sexual violence",
    urgent: "Medicine that prevents HIV works best within 72 hours",
    body: "What to do, where to go, and what happens when you get there. Nothing is reported to anyone without your agreement.",
  },
  {
    href: "/get-help/hiv",
    title: "HIV testing & PrEP",
    urgent: "Free, confidential, no appointment needed",
    body: "Community testing, self-test kits and same-day linkage to treatment if you need it.",
  },
  {
    href: "/get-help/tb",
    title: "TB symptoms",
    urgent: "A cough lasting more than two weeks should be checked",
    body: "Free screening, sputum testing through partner laboratories, and support through the full six-month treatment course.",
  },
  {
    href: "/get-help/cancer",
    title: "Cervical & breast screening",
    urgent: "Cervical cancer is preventable when found early",
    body: "Free screening days with partner facilities, and someone to walk you through treatment if anything is found.",
  },
];

const faqs = [
  {
    q: "Does it cost anything?",
    a: "No. Every service we offer is free. If cost of transport is what is stopping you, tell us — we can often help with that too.",
  },
  {
    q: "Will anyone find out?",
    a: "No. We never disclose a result, a diagnosis or a disclosure of violence to a family member, partner, employer or anyone else. Testing is done in private, and our records are kept under lock with restricted access.",
  },
  {
    q: "Do I need an appointment or an ID?",
    a: "No to both. Community testing and screening are open to anyone who comes.",
  },
  {
    q: "What if I don't want to be tested?",
    a: "Then you will not be tested. Everything we offer is a choice, and declining changes nothing about how you are treated or what else you can access.",
  },
  {
    q: "I'm under 18. Can I still come?",
    a: "Yes. Adolescents can access HIV testing and sexual and reproductive health information. Our staff are trained in working with young people, and our safe spaces exist precisely for this.",
  },
];

export default function GetHelpPage() {
  return (
    <>
      <FaqJsonLd faqs={faqs} />

      <PageHero
        title="Getting help is free, and nobody will be told."
        lead="You do not need an appointment, an ID or money. If you are in immediate danger, call 999 or 112 right now."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Get help", href: "/get-help" },
        ]}
      />

      {/* Phone numbers first. Someone in crisis needs a number, not an essay. */}
      <section className="border-b border-navy-100 bg-azure-50">
        <div className="container-page py-12">
          <AfterHoursLines className="mb-8" />

          <h2 className="text-2xl font-extrabold tracking-tight text-navy-950">
            Numbers that answer now
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {site.help.lines.map((line) => (
              <li key={line.label}>
                <a
                  href={`tel:${line.number.replace(/\s/g, "")}`}
                  className="flex h-full items-center gap-4 rounded-card border-2 border-azure-200 bg-white px-4 py-4 transition-colors hover:border-azure-500 hover:bg-azure-50/60"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-azure-600 text-white">
                    <Phone className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wide text-navy-500">
                      {line.label}
                    </span>
                    <span className="block text-xl font-extrabold leading-tight text-navy-950">
                      {line.number}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-navy-500">
                      <Clock className="size-3" aria-hidden="true" />
                      {line.note}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Section>
        <SectionHeading
          title="Choose what fits your situation"
          lead="Each of these explains what happens, what it costs (nothing), and what you can expect from us."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group rounded-card border-2 border-navy-100 bg-white p-7 transition-colors hover:border-azure-400 hover:bg-azure-50/40"
            >
              <h3 className="text-xl font-extrabold text-navy-950">{service.title}</h3>
              <p className="mt-2 text-sm font-bold text-azure-700">{service.urgent}</p>
              <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                {service.body}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-bold text-azure-700">
                Read more
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* If we are not operating near someone this month, the pathway should
          not simply end. Stawisha Care covers the same ground online. */}
      <section className="border-y-2 border-azure-200 bg-azure-50">
        <div className="container-page py-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-navy-950">
                Not near one of our teams?
              </h2>
              <p className="mt-3 max-w-xl text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                {site.referralPartner.blurb} We refer people to{" "}
                <span className="font-bold text-navy-950">{site.referralPartner.name}</span> when
                they need a service we are not running in their county.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <a
                href={site.referralPartner.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-navy-900 px-6 text-[0.9375rem] font-bold text-white transition-colors hover:bg-navy-800"
              >
                Visit {site.referralPartner.name}
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
              <p className="mt-2.5 text-xs font-medium text-navy-500">
                Opens {new URL(site.referralPartner.url).hostname} in a new tab
              </p>
            </div>
          </div>
        </div>
      </section>

      <Section tone="tint">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              title="What confidentiality actually means here"
            />
            <ul className="mt-8 space-y-5">
              {[
                "We never tell your family, your partner or your employer anything. Not a result, not a diagnosis, not that you came at all.",
                "You decide what happens next. Every option is explained and every one of them can be declined.",
                "Records are kept under lock, with access limited to the staff who need them. No client information is ever put on this website.",
                "You can raise a concern about any of our staff confidentially, and it reaches our board — not the person you are complaining about.",
              ].map((item) => (
                <li key={item} className="flex gap-3.5">
                  <ShieldCheck
                    className="mt-0.5 size-5 shrink-0 text-azure-600"
                    aria-hidden="true"
                  />
                  <span className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border-2 border-navy-100 bg-white p-7">
            <h2 className="text-xl font-extrabold text-navy-950">Where to find us</h2>
            <address className="mt-4 flex gap-3 text-[0.9375rem] font-medium not-italic leading-relaxed text-navy-700">
              <MapPin className="mt-0.5 size-5 shrink-0 text-azure-600" aria-hidden="true" />
              <span>
                {site.contact.address.street}
                <br />
                {site.contact.address.locality}, {site.contact.address.postalCode}
                <br />
                {site.contact.address.countryName}
              </span>
            </address>
            <p className="mt-4 text-[0.9375rem] font-medium text-navy-600">
              {site.contact.hours}
            </p>
            <p className="mt-5 border-t border-navy-100 pt-5 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
              Our outreach teams also work across Kisumu, Kilifi, Nakuru, Machakos, Kakamega,
              Nairobi and Homa Bay. Call us and we will tell you when we are next near you.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading align="center" title="Things people ask us" />
        <dl className="mx-auto mt-12 max-w-3xl divide-y divide-navy-100 border-y border-navy-100">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-6">
              <dt className="text-lg font-extrabold text-navy-950">{faq.q}</dt>
              <dd className="mt-2.5 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                {faq.a}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
