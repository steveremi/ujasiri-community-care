import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, CalendarClock, MapPin, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState, Section, SectionHeading } from "@/components/ui/primitives";
import { EMPLOYMENT_LABELS, daysUntilClose, listOpenJobs } from "@/lib/repos/jobs";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

// Vacancies close on a date, so the listing must not be cached past it.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Current vacancies at Ujasiri Community Care — community health roles in HIV, TB, cancer screening, GBV response and adolescent girls' health across Kenya.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: `Careers at ${site.name}`,
    description: "Current vacancies in community health across Kenya.",
    url: "/careers",
  },
};

const hiringSteps = [
  {
    title: "Apply online",
    body: "Complete the form on the vacancy page. There is no CV parser and no automated rejection — a person reads every application.",
  },
  {
    title: "Shortlisting",
    body: "Done against the published criteria by at least two people, after the closing date. We do not shortlist on a rolling basis, so applying early is no advantage.",
  },
  {
    title: "Interview",
    body: "The same questions for every candidate for a given role, scored independently. Expect a practical exercise for most posts.",
  },
  {
    title: "Checks",
    body: "References, and a background check for any role in contact with clients. Safeguarding induction is completed before your first day, not after.",
  },
];

export default async function CareersPage() {
  const jobs = await listOpenJobs();

  return (
    <>
      <PageHero
        title="Work with us"
        lead="Community health work is difficult, frequently uncomfortable, and occasionally the best job there is. Every vacancy we have is listed below — if nothing is listed, nothing is open."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Careers", href: "/careers" },
        ]}
      />

      <Section>
        <SectionHeading
          title={
            jobs.length === 0
              ? "No open vacancies right now"
              : `${jobs.length} open ${jobs.length === 1 ? "vacancy" : "vacancies"}`
          }
          lead="We advertise every role openly and do not fill posts by word of mouth. Applications are only accepted against a live advert."
        />

        {jobs.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="Nothing open at the moment"
            description="We do not keep dormant adverts up to collect CVs. Check back, or send a speculative expression of interest — we keep them for six months and will get in touch if something matching comes up."
            action={
              <ButtonLink href="/contact" variant="outline">
                Send an expression of interest
              </ButtonLink>
            }
          />
        ) : (
          <ul className="mt-10 space-y-4">
            {jobs.map((job) => {
              const days = daysUntilClose(job);
              const closingSoon = days !== null && days <= 7;

              return (
                <li key={job.id}>
                  <article className="group relative rounded-card border-2 border-navy-100 bg-white p-6 transition-colors hover:border-azure-400 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge tone="azure">{EMPLOYMENT_LABELS[job.employment_type]}</Badge>
                      <Badge tone="neutral">{job.department}</Badge>
                      {closingSoon && (
                        <Badge tone="amber">
                          {days === 0
                            ? "Closes today"
                            : `Closes in ${days} day${days === 1 ? "" : "s"}`}
                        </Badge>
                      )}
                    </div>

                    <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-navy-950">
                      <Link
                        href={`/careers/${job.slug}`}
                        className="after:absolute after:inset-0"
                      >
                        {job.title}
                      </Link>
                    </h3>

                    <p className="mt-2.5 max-w-2xl text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                      {job.summary}
                    </p>

                    <dl className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-navy-100 pt-4 text-sm font-semibold text-navy-600">
                      <div className="flex items-center gap-2">
                        <dt className="sr-only">Location</dt>
                        <MapPin className="size-4 text-azure-600" aria-hidden="true" />
                        <dd>{job.location}</dd>
                      </div>
                      {job.salary_range && (
                        <div className="flex items-center gap-2">
                          <dt className="sr-only">Salary</dt>
                          <Briefcase className="size-4 text-azure-600" aria-hidden="true" />
                          <dd>{job.salary_range}</dd>
                        </div>
                      )}
                      {job.closes_on && (
                        <div className="flex items-center gap-2">
                          <dt className="sr-only">Closing date</dt>
                          <CalendarClock className="size-4 text-azure-600" aria-hidden="true" />
                          <dd>Closes {formatDate(job.closes_on)}</dd>
                        </div>
                      )}
                    </dl>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section tone="tint">
        <SectionHeading
          title="How we hire"
          lead="The same process for every role, published so you know what you are walking into."
        />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {hiringSteps.map((step, i) => (
            <li key={step.title} className="rounded-card border-2 border-navy-100 bg-white p-6">
              <span className="grid size-9 place-items-center rounded-full bg-navy-900 text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-navy-950">{step.title}</h3>
              <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              title="What we look for"
              lead="Beyond whatever the specific vacancy asks for."
            />
            <ul className="mt-8 space-y-4">
              {[
                "People who can hold a confidence. Most of what you learn in this job is not yours to repeat, ever.",
                "People who are comfortable being told they are wrong — including by the communities we serve.",
                "Enough Kiswahili and ideally a local language to work without an intermediary.",
                "Willingness to work some evenings and weekends. The people we most need to reach are not free during office hours.",
                "Patience with the unglamorous part. The follow-up call at six months is the job; the testing day is just the start of it.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-azure-500" aria-hidden="true" />
                  <span className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-7">
              <ShieldCheck className="size-6 text-azure-700" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-extrabold text-navy-950">
                Safeguarding applies to everyone
              </h2>
              <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                Every role in contact with clients requires a satisfactory background check and
                completion of safeguarding induction <em>before</em> your first day. Annual
                refresher training is mandatory thereafter, with no exemptions — including for
                senior staff and trustees.
              </p>
              <Link
                href="/governance#safeguarding"
                className="mt-4 inline-block text-[0.9375rem] font-bold text-azure-700 underline underline-offset-4"
              >
                Read our safeguarding policy →
              </Link>
            </div>

            <div className="rounded-card border-2 border-navy-100 p-7">
              <h2 className="text-xl font-extrabold text-navy-950">Already work here?</h2>
              <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                Leave requests, reference letters, payroll queries, equipment, policy questions and
                grievances all go through the staff HR desk. Grievances are routed confidentially,
                away from your own line manager.
              </p>
              <ButtonLink href="/admin/hr" size="md" className="mt-5">
                Staff HR requests
              </ButtonLink>
              <p className="mt-2.5 text-xs font-medium text-navy-500">
                Requires a staff account.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="tint">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            align="center"
            title="Volunteering is a real route in"
            lead="Several of our staff started as volunteers, and several of our community health promoters came through the programmes themselves. Intakes run twice a year, with the same checks and induction as paid staff."
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/get-involved/volunteer">Volunteer with us</ButtonLink>
            <ButtonLink href="/about" variant="outline">
              About Ujasiri
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
