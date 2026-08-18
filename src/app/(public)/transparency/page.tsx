import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  FileText,
  Landmark,
  Megaphone,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";

import { ImageRotator } from "@/components/media/image-rotator";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { TRANSPARENCY, split } from "@/lib/gallery";
import { getSettings } from "@/lib/repos/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Transparency & accountability",
  description:
    "How Ujasiri Community Care is held to account — independently audited accounts, an independent board of trustees, open procurement, and a confidential route to raise a concern.",
  alternates: { canonical: "/transparency" },
};

/**
 * Transparency.
 *
 * The page leads with the organisation's accountability *commitments* — how
 * accounts are prepared, who audits them, how anyone can obtain them, and how
 * to complain — because those are verifiable by inspection and true today.
 *
 * The spending breakdown renders only when real audited figures have been
 * entered from the admin. An NGO publishing invented financial figures is the
 * single fastest way to lose the trust this page exists to build, so the page
 * is built to be honest and complete with no numbers at all.
 */
export default async function TransparencyPage() {
  const site = await getSettings();




  /**
   * Who checks this organisation, and what each of them actually does.
   *
   * Previously this page carried two overlapping lists — four "bodies" and six
   * "commitments" — and half the commitments simply restated a body. One list,
   * with each body's specific power spelled out, says more in less space.
   */
  const checks = [
    {
      Icon: Users,
      title: "Our board",
      role: "Approves the budget. Appoints the auditor.",
      body: "Unpaid trustees, independent of management, recruited openly. At least one lives in a county where we work.",
    },
    {
      Icon: FileText,
      title: "An independent auditor",
      role: "Audits the accounts every year.",
      body: "Appointed by the board, not by management, and rotated in line with good practice.",
    },
    {
      Icon: Landmark,
      title: `The ${site.registration.authority}`,
      role: "Regulates us. Takes complaints directly.",
      body: "We file annually. Anyone unhappy with how we handled a concern can escalate without coming through us.",
    },
    {
      Icon: Megaphone,
      title: "The communities we serve",
      role: "Hear the accounts read aloud.",
      body: "Presented in person each year in a county where we work, open to anyone, questions taken for as long as there are questions.",
    },
  ];


  /** Practices that are not covered by naming a body above. */
  const practices = [
    {
      Icon: BadgeCheck,
      title: "Published in full, not in summary",
      body: "Financial statements, the auditor's letter and the trustees' report, complete — including the section on what did not work, which our board argues about every year and which stays in.",
    },
    {
      Icon: ShieldCheck,
      title: "A complaints route that bypasses us",
      body: "Concerns about our finances or conduct reach trustees through a channel independent of the people being complained about. You can report anonymously, and you will not be penalised for raising something in good faith.",
    },
    {
      Icon: Scale,
      title: "Open, recorded procurement",
      body: "Tenders are advertised openly and evaluated against published criteria by a committee of at least three. We do not procure from anyone connected to a trustee or member of staff without an open process and a recorded board decision.",
    },
  ];


  return (
    <>
      <PageHero
        title="How we are held to account"
        lead="Being trusted with money is not the same as being transparent about it. This page sets out exactly how our accounts are prepared, who checks them, how you can get hold of them, and what to do if you think something is wrong."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Transparency", href: "/transparency" },
        ]}
        images={split(TRANSPARENCY, 0, 3)}
        imageSeed={2}
      />

      {/* ------------------------------------------------------ Four checks --- */}
      {/* Registration and tax numbers are internal reference data. Displaying
          them in large type reads as an organisation trying to prove itself
          rather than one that is simply established. They appear once, small,
          in the footer where a reader who wants them knows to look. */}
      <Section>
        <SectionHeading
          title="Four checks on this organisation"
          lead="None of them reports to our management. That separation is what makes accountability structural rather than declared — and it is the part worth checking before you believe any number we publish."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {checks.map((check, i) => (
            <Reveal key={check.title} delay={i * 80}>
              <article className="group flex h-full flex-col rounded-card border-2 border-navy-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                <span className="grid size-11 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                  <check.Icon className="size-5" aria-hidden="true" />
                </span>

                <h3 className="mt-5 text-base font-extrabold leading-snug text-navy-950">
                  {check.title}
                </h3>

                {/* The power this body actually holds, carried in azure so it
                    reads before the explanation beneath it. */}
                <p className="mt-2 text-sm font-bold leading-snug text-azure-700">
                  {check.role}
                </p>

                <p className="mt-3 flex-1 text-[0.8125rem] font-medium leading-relaxed text-navy-600">
                  {check.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------- In practice --- */}
      <Section tone="tint">
        <SectionHeading
          title="What that looks like in practice"
          lead="Three things that follow from the structure above, each of which you can test by asking us to produce the evidence."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {practices.map((item, i) => (
            <Reveal key={item.title} delay={i * 90}>
              <div className="group h-full rounded-card border-2 border-navy-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                <span className="grid size-11 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                  <item.Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold leading-snug text-navy-950">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Full-width band, breaking the page before the accounts section. */}
      <section className="border-y border-navy-100">
        <ImageRotator
          images={split(TRANSPARENCY, 1, 3)}
          alt="Ujasiri Community Care teams and the communities we are accountable to"
          offset={3}
          interval={6000}
          overlay
          className="h-72 w-full sm:h-88 lg:h-[26rem]"
          sizes="100vw"
        />
      </section>

      {/* -------------------------------------------------------- Documents --- */}
      {/* Spending is reported to the board, the regulator and our funders. It
          is not published line by line here: a breakdown invites a reader to
          judge community health work by its overhead ratio, which is a poor
          proxy for whether anyone got treated. What is public is the process,
          the documents on request, and the results on /impact. */}
      <Section tone="tint">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div>
            <SectionHeading
              title="Our accounts"
              lead="Audited annually and available in full to anyone who asks — funders, communities, journalists or members of the public."
            />

            <div className="mt-8 space-y-5">
              <div className="rounded-card border-2 border-navy-200 bg-white p-7">
                <h3 className="text-lg font-extrabold text-navy-950">
                  Why we do not publish a spending breakdown here
                </h3>
                <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  Not because it is hidden — the full accounts go to our board, our regulator and
                  every funder, and we will send them to you today if you ask.
                </p>
                <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  But an overhead ratio on a homepage is a poor way to judge community health
                  work. It rewards organisations that under-invest in the follow-up calls,
                  supervision and data systems that decide whether anyone actually stays in
                  treatment. We would rather be judged on whether people are still in care six
                  months later — and we publish that.
                </p>
                <Link
                  href="/impact"
                  className="mt-4 inline-block text-[0.9375rem] font-bold text-azure-700 underline underline-offset-4"
                >
                  See the results we publish instead →
                </Link>
              </div>

              <div className="rounded-card border-2 border-navy-100 bg-white p-7">
                <h3 className="text-lg font-extrabold text-navy-950">
                  How to obtain the full accounts
                </h3>
                <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  Email us and we will send the complete audited statements, the auditor&apos;s
                  letter and the trustees&apos; report the same week. There is no form, no
                  sign-up, and you will not be added to any list.
                </p>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="mt-4 inline-block text-[0.9375rem] font-bold text-azure-700 underline underline-offset-4"
                >
                  {site.contact.email}
                </a>
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <ImageRotator
              images={split(TRANSPARENCY, 2, 3)}
              alt="A community review meeting"
              offset={1}
              className="aspect-4/3 rounded-card shadow-card"
              sizes="(min-width: 1024px) 30vw, 100vw"
            />

            <div className="rounded-card border-2 border-navy-100 bg-white p-6">
              <Landmark className="size-5 text-azure-600" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-extrabold text-navy-950">Ask us for anything</h3>
              <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                Full accounts, any policy, our safeguarding procedures, the auditor&apos;s
                management letter, or the definition behind any figure we publish.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <ButtonLink href="/reports" size="md">
                  Annual reports
                </ButtonLink>
                <ButtonLink href="/contact" size="md" variant="outline">
                  Request the accounts
                </ButtonLink>
                <ButtonLink href="/accountability" size="md" variant="ghost">
                  Raise a concern
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            title="What a spending breakdown does not tell you"
            lead="Where money went is not the same question as whether it did any good. We report on that separately, with the definitions and the sources attached — including the results that did not go our way."
          />
          <p className="mt-8">
            <Link
              href="/impact"
              className="text-[0.9375rem] font-bold text-azure-700 underline underline-offset-4"
            >
              See how we measure impact →
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
