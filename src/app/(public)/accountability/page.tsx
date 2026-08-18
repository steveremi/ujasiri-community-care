import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  EyeOff,
  Mail,
  Landmark,
  MessageSquare,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";

import { ImageRotator } from "@/components/media/image-rotator";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { ACCOUNTABILITY, split } from "@/lib/gallery";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accountability",
  description:
    "How to raise a concern or make a complaint about Ujasiri Community Care — confidentially, anonymously if you prefer, and directly to our board.",
  alternates: { canonical: "/accountability" },
};

/**
 * Raising a concern.
 *
 * Composed as its own page rather than through `InfoPage`. The shared component
 * renders one column of prose, which is right for a policy read start to finish
 * and wrong here: somebody arriving on this page wants one specific thing —
 * usually how to report, or what will happen to them if they do — and needs to
 * find it by scanning, not by reading. So the reporting routes are a card grid,
 * the process is a numbered sequence, and the escalation route is pulled out on
 * its own, matching the shape of /transparency.
 *
 * Every address, number and regulator link is read from lib/site, so none of it
 * can drift out of step with the rest of the site.
 */

/** The regulator's entry in the shared quick links, matched on the authority. */
const regulator = site.quickLinks.find((l) => l.label === site.registration.authority);

export default function AccountabilityPage() {
  const routes = [
    {
      Icon: Mail,
      title: "Email the safeguarding chair",
      detail: site.contact.safeguardingEmail,
      href: `mailto:${site.contact.safeguardingEmail}`,
      body: "Goes to the chair of the safeguarding committee, who is a trustee — not to our management.",
    },
    {
      Icon: Phone,
      title: "Call the office",
      detail: site.customerCare.lines[0],
      href: `tel:${site.customerCare.lines[0].replace(/\s/g, "")}`,
      body: "Ask to speak to the safeguarding lead. You do not have to say what it is about.",
    },
    {
      Icon: Users,
      title: "Tell any member of staff",
      detail: "Any of our team",
      body: "They are required to pass it on, and required not to investigate it themselves.",
    },
    {
      Icon: Building2,
      title: "Write to the board",
      detail: `${site.contact.address.street}, ${site.contact.address.locality}`,
      body: "Marked for the attention of the Chair, at our registered address.",
    },
  ];

  const process = [
    {
      n: "01",
      Icon: Clock,
      title: "We acknowledge it",
      body: "Within three working days, wherever you have given us a way to reach you.",
    },
    {
      n: "02",
      Icon: ShieldCheck,
      title: "Trustees handle it, not managers",
      body: "It goes to trustees, never to the person's own line manager — so nobody is ever asked to investigate a concern about themselves.",
    },
    {
      n: "03",
      Icon: CheckCircle2,
      title: "You are told the outcome",
      body: "Unless that would breach someone else's confidentiality. Where we cannot give the detail, we say so plainly rather than going quiet.",
    },
  ];

  return (
    <>
      <PageHero
        title="If something has gone wrong, we want to hear it"
        lead={
          <>
            <p>
              It takes something to tell an organisation that it has let you down — and more
              still when that organisation holds something you need. So we have tried to make
              this part easy.
            </p>
            <p className="mt-4">
              You can tell us without giving your name, without explaining yourself first, and
              without any risk to the care or support you receive from us. It does not have to
              be a formal complaint, you do not need evidence, and you do not need to be sure.
              If something felt wrong, that is reason enough to say so.
            </p>
            <p className="mt-4">
              Everything below simply sets out who hears it, what happens next, and how long
              each step takes.
            </p>
          </>
        }
        // "Raising a concern" was both the breadcrumb and the heading, so the
        // page opened by saying the same four words twice. The crumb now
        // matches how this page is labelled in the nav and the footer.
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Accountability", href: "/accountability" },
        ]}
        // Reserved block — calm, adult, wide frames. This page carries no close
        // portraits of children: it is where somebody reports harm, sometimes
        // harm done to a child, and a face beside that implies something no
        // caption takes back.
        images={split(ACCOUNTABILITY, 0, 3)}
        imageSeed={1}
      />

      {/* ------------------------------------------------ The two guarantees */}
      {/* First, because these are what decide whether somebody reports at all.
          Everything else on this page is procedure. */}
      <Section>
        <SectionHeading
          title="Two things we guarantee first"
          lead="Before any of the procedure below, these are the two commitments that decide whether somebody feels able to report at all."
        />

        {/* Two cards stretched across the full grid gave each one roughly six
            hundred pixels to hold two lines of text, so they read as oversized
            panels rather than as a pair of short guarantees. Capped to the
            width of the prose above them and stepped down a size — the content
            is brief, and the card should be too. */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:max-w-4xl">
          {[
            {
              Icon: EyeOff,
              title: "You can report anonymously",
              body: "You do not have to give your name. An anonymous report is taken as seriously as a named one — it is simply harder for us to come back to you with the outcome.",
            },
            {
              Icon: ShieldCheck,
              title: "You will not be penalised",
              body: "Not for raising a concern in good faith — whether you are a client, a member of staff, a volunteer or a member of the community.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 100}>
              <div className="group flex h-full flex-col rounded-card border-2 border-azure-200 bg-azure-50/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-azure-400 hover:shadow-lift">
                <span className="grid size-10 place-items-center rounded-xl bg-white text-azure-700 shadow-sm transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                  <item.Icon className="size-[1.125rem]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-extrabold leading-snug text-navy-950">
                  {item.title}
                </h3>
                <p className="mt-2.5 flex-1 text-sm font-medium leading-relaxed text-navy-700">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------- Four routes in */}
      <Section tone="tint">
        <SectionHeading
          title="Four ways to report"
          lead="Use whichever you are most comfortable with. The first two reach a trustee directly, without passing through the people a concern might be about."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((route, i) => (
            <Reveal key={route.title} delay={i * 80}>
              <article className="group flex h-full flex-col rounded-card border-2 border-navy-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                <span className="grid size-11 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                  <route.Icon className="size-5" aria-hidden="true" />
                </span>

                <h3 className="mt-5 text-base font-extrabold leading-snug text-navy-950">
                  {route.title}
                </h3>

                {/* The actual address or number, carried in azure so it reads
                    before the explanation beneath it. */}
                {route.href ? (
                  <a
                    href={route.href}
                    className="mt-2 break-words text-sm font-bold leading-snug text-azure-700 underline-offset-4 hover:underline"
                  >
                    {route.detail}
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-bold leading-snug text-azure-700">
                    {route.detail}
                  </p>
                )}

                <p className="mt-3 flex-1 text-[0.8125rem] font-medium leading-relaxed text-navy-600">
                  {route.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Full-width band, breaking the page before the process. */}
      <section className="border-y border-navy-100">
        <ImageRotator
          images={split(ACCOUNTABILITY, 1, 3)}
          alt="The communities Ujasiri Community Care is accountable to"
          offset={2}
          interval={6000}
          overlay
          className="h-72 w-full sm:h-88 lg:h-[26rem]"
          sizes="100vw"
        />
      </section>

      {/* ------------------------------------------------- What happens next */}
      <Section tone="tint">
        <SectionHeading
          title="What happens next"
          lead="Three things follow from every report we receive. Each of them is a commitment you can hold us to."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {process.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div className="group h-full rounded-card border-2 border-navy-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                    <step.Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm font-extrabold text-azure-600">{step.n}</span>
                </div>
                <h3 className="mt-5 text-lg font-extrabold leading-snug text-navy-950">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------- Going above */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div>
            <SectionHeading
              title="Taking it further"
              lead="We are not the final word on our own conduct, and that is by design. Two independent routes are open to you at any point."
            />

            {/* Both routes get the identical card shape — icon, heading,
                body, link. An earlier version gave one an inline icon in a flex
                row and the other none, which made a pair of equals read as two
                unrelated things. */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                {
                  Icon: Landmark,
                  title: "Our regulator",
                  // Deliberately does not recite the registration number. It
                  // proves nothing on its own — the public register does — and
                  // a reader who wants it will find it in the footer.
                  body: `The ${site.registration.authority} regulates non-governmental organisations in Kenya and holds our registration. If our handling of a concern falls short, they are the people to tell, and you do not need to come through us to reach them.`,
                  href: regulator?.href,
                  linkLabel: regulator?.label,
                  external: true,
                },
                {
                  Icon: AlertTriangle,
                  title: "The police",
                  body: "Any matter that may be a criminal offence can go straight to the police, at any stage. Where we report an offence ourselves and a survivor is involved, we discuss it with them first wherever the law allows.",
                  href: "/get-help/gbv",
                  linkLabel: "After sexual violence",
                  external: false,
                },
              ].map((card, i) => (
                <Reveal key={card.title} delay={i * 100}>
                  <div className="group flex h-full flex-col rounded-card border-2 border-navy-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift">
                    <span className="grid size-11 place-items-center rounded-xl bg-azure-50 text-azure-700 transition-colors duration-300 group-hover:bg-azure-500 group-hover:text-white">
                      <card.Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg font-extrabold leading-snug text-navy-950">
                      {card.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                      {card.body}
                    </p>
                    {card.href && card.linkLabel && (
                      card.external ? (
                        <a
                          href={card.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-5 inline-block text-[0.9375rem] font-bold text-azure-700 underline underline-offset-4"
                        >
                          {card.linkLabel} →
                        </a>
                      ) : (
                        <Link
                          href={card.href}
                          className="mt-5 inline-block text-[0.9375rem] font-bold text-azure-700 underline underline-offset-4"
                        >
                          {card.linkLabel} →
                        </Link>
                      )
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <ImageRotator
              images={split(ACCOUNTABILITY, 2, 3)}
              alt="A community review meeting"
              offset={1}
              interval={6400}
              className="aspect-4/3 rounded-card shadow-card"
              sizes="(min-width: 1024px) 30vw, 100vw"
            />

            {/* Saying this keeps ordinary feedback from being pushed down a
                safeguarding route designed for something much heavier. */}
            <div className="rounded-card border-2 border-navy-100 bg-white p-6">
              <MessageSquare className="size-5 text-azure-600" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-extrabold text-navy-950">
                Not everything is a complaint
              </h3>
              <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                If our service was slow, confusing, or simply not what you needed, tell us that
                too. It is how the work gets better.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <ButtonLink href="/contact" size="md">
                  Send us feedback
                </ButtonLink>
                <ButtonLink href="/governance" size="md" variant="outline">
                  Safeguarding policy
                </ButtonLink>
                <ButtonLink href="/transparency" size="md" variant="ghost">
                  How we are held to account
                </ButtonLink>
              </div>
            </div>

            <p className="text-sm font-medium text-navy-600">
              <Link
                href="/get-help"
                className="font-bold text-azure-700 underline underline-offset-4"
              >
                ← All support services
              </Link>
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
