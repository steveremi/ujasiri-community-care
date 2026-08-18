import type { Metadata } from "next";
import { BadgeCheck, FileText, Landmark, Receipt } from "lucide-react";

import { AcceptedPayments } from "@/components/payments/payment-marks";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { DonateForm } from "@/components/site/donate-form";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { listFinanceLines, listProjects } from "@/lib/repos/content";
import { site } from "@/lib/site";
import { percent } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support HIV and TB prevention, cancer screening, GBV survivor services and adolescent girls' health in Kenya. Give securely by M-Pesa, Airtel Money, card or PayPal.",
  alternates: { canonical: "/donate" },
  openGraph: {
    title: `Donate to ${site.name}`,
    description:
      "Give by M-Pesa, Airtel Money, card or PayPal. 83% of every shilling goes directly to programmes.",
    url: "/donate",
  },
};

const faqs = [
  {
    q: "How much of my donation reaches the programmes?",
    a: "83 shillings in every 100, verified in our independently audited 2025 accounts. The remaining 17 covers administration, governance and the cost of raising the next shilling. We publish the full breakdown rather than hiding it.",
  },
  {
    q: "Is my donation tax deductible?",
    a: `Yes. Ujasiri Community Care holds tax exemption ${site.registration.taxNumber} as a Public Benefit Organisation. Your emailed receipt is a valid document for tax purposes.`,
  },
  {
    q: "Can I choose what my gift funds?",
    a: "You can designate your gift to a specific project. We would gently encourage an unrestricted gift instead — it lets us move money to whichever programme has the most urgent need, which is rarely the one with the best photographs.",
  },
  {
    q: "Is it safe to give by M-Pesa or card?",
    a: "Yes. Payment is handled entirely by the provider you choose — Safaricom, Airtel, Stripe or PayPal. We never see or store your card number or your M-Pesa PIN.",
  },
  {
    q: "Can I cancel a monthly gift?",
    a: "At any time, with no questions asked. Email us or use the link in any receipt. Monthly gifts are valuable precisely because they are predictable, but never because they are hard to stop.",
  },
];

export default async function DonatePage() {
  const [projectPage, finance] = await Promise.all([
    listProjects({ page: 1, perPage: 50 }),
    listFinanceLines(2025),
  ]);

  const total = finance.reduce((s, l) => s + l.amount_cents, 0);
  const programmeShare = percent(
    finance.filter((l) => l.category === "programmes").reduce((s, l) => s + l.amount_cents, 0),
    total,
  );

  return (
    <>
      <FaqJsonLd faqs={faqs} />

      <section className="bg-navy-950">
        <div className="container-page py-16 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
              A test costs less than lunch. Staying in care costs a little more.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-navy-200">
              Your gift pays for the part nobody funds: the follow-up call at three months, the
              transport to a treatment appointment, the second HPV dose that actually protects.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-20">
        {/* The form comes first in the DOM as well as visually on mobile —
            a donor who has decided should never have to scroll past our
            reassurances to reach the fields. */}
        <div className="rounded-card border border-navy-100 bg-white p-6 shadow-card sm:p-8 lg:order-1">
          <h2 className="text-2xl font-extrabold text-navy-950">Make a donation</h2>
          <p className="mt-2 text-[0.9375rem] text-navy-600">
            Takes about a minute. Every gift is receipted.
          </p>
          <div className="mt-7">
            <DonateForm projects={projectPage.items} />
          </div>
        </div>

        <aside className="space-y-8 lg:order-2">
          <div className="rounded-card border border-navy-100 bg-navy-50/50 p-6">
            <h2 className="text-lg font-extrabold text-navy-950">
              Why you can trust us with this
            </h2>
            <ul className="mt-5 space-y-4">
              {[
                {
                  Icon: BadgeCheck,
                  title: "A registered NGO",
                  body: `${site.registration.label} ${site.registration.number}, registered with the ${site.registration.authority}. You can verify us independently.`,
                },
                {
                  Icon: FileText,
                  title: "Audited and published",
                  body: `${programmeShare}% of spending goes to programmes. Our full accounts are published every year, including what did not work.`,
                },
                {
                  Icon: Receipt,
                  title: "Receipted and deductible",
                  body: `Tax exemption ${site.registration.taxNumber}. Your receipt arrives by email straight away.`,
                },
                {
                  Icon: Landmark,
                  title: "We never hold your details",
                  body: "Payments are processed entirely by Safaricom, Airtel, Stripe or PayPal. No card or PIN data touches our systems.",
                },
              ].map(({ Icon, title, body }) => (
                <li key={title} className="flex gap-3.5">
                  <Icon className="mt-0.5 size-5 shrink-0 text-azure-600" aria-hidden="true" />
                  <div>
                    <h3 className="text-[0.9375rem] font-semibold text-navy-900">{title}</h3>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-navy-600">{body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-navy-200/60 pt-5">
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">
                We accept
              </p>
              <AcceptedPayments className="mt-3 flex flex-wrap items-center gap-2.5" />
            </div>
          </div>

          <div className="rounded-card border border-navy-100 p-6">
            <h2 className="text-lg font-extrabold text-navy-950">
              Other ways to give
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-navy-900">Bank transfer</dt>
                <dd className="mt-1 leading-relaxed text-navy-600">
                  For gifts above KES 500,000 a direct transfer avoids processing fees
                  entirely. Email{" "}
                  <a
                    href={`mailto:${site.contact.supportEmail}`}
                    className="font-medium text-azure-700 underline underline-offset-4"
                  >
                    {site.contact.supportEmail}
                  </a>{" "}
                  for our account details.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy-900">Payroll giving &amp; corporate</dt>
                <dd className="mt-1 leading-relaxed text-navy-600">
                  We can set up matched or payroll giving with your employer. Get in touch and
                  we will handle the paperwork.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy-900">Leave a gift in your will</dt>
                <dd className="mt-1 leading-relaxed text-navy-600">
                  A legacy gift funds work years from now. We will put you in touch with an
                  independent adviser — never our own.
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <Section tone="tint">
        <SectionHeading
          align="center"
          title="Questions donors actually ask"
        />
        <dl className="mx-auto mt-12 max-w-3xl divide-y divide-navy-100 border-y border-navy-100">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-6">
              <dt className="text-lg font-extrabold text-navy-950">{faq.q}</dt>
              <dd className="mt-2.5 text-[0.9375rem] leading-relaxed text-navy-600">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
