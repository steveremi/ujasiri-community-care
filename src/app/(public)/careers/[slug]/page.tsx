import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, CalendarClock, MapPin } from "lucide-react";

import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { JobApplicationForm } from "@/components/site/job-application-form";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/primitives";
import { EMPLOYMENT_LABELS, allJobSlugs, daysUntilClose, getJob } from "@/lib/repos/jobs";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await allJobSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: "Vacancy not found" };

  return {
    title: `${job.title} — ${job.location}`,
    description: job.summary,
    alternates: { canonical: `/careers/${job.slug}` },
    openGraph: { title: job.title, description: job.summary, url: `/careers/${job.slug}` },
  };
}

/** Renders "- " prefixed lines as a list, everything else as paragraphs. */
function RichText({ text }: { text: string }) {
  const blocks = text.split("\n").filter((line) => line.trim());
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (bullets.length) {
      out.push(
        <ul key={`ul-${key}`}>
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  blocks.forEach((line, i) => {
    if (line.trimStart().startsWith("- ")) {
      bullets.push(line.trimStart().slice(2));
    } else {
      flush(String(i));
      out.push(<p key={i}>{line}</p>);
    }
  });
  flush("end");

  return <>{out}</>;
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();

  const days = daysUntilClose(job);
  const closed = job.status !== "open" || (days !== null && days < 0);

  const trail = [
    { name: "Home", href: "/" },
    { name: "Careers", href: "/careers" },
    { name: job.title, href: `/careers/${job.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd trail={trail} />

      {/* JobPosting structured data — this is what puts a vacancy into Google
          for Jobs, which for a Kenyan NGO is a materially larger applicant
          pool than any job board. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: `${job.summary}\n\n${job.description}\n\n${job.responsibilities}\n\n${job.requirements}`,
            datePosted: job.published_at,
            validThrough: job.closes_on,
            employmentType: job.employment_type.toUpperCase(),
            hiringOrganization: {
              "@type": "NGO",
              name: site.name,
              sameAs: site.url,
            },
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: job.location,
                addressCountry: "KE",
              },
            },
            directApply: true,
          }).replace(/</g, "\\u003c"),
        }}
      />

      <PageHero title={job.title} lead={job.summary} breadcrumbs={trail}>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone="azure">{EMPLOYMENT_LABELS[job.employment_type]}</Badge>
          <Badge tone="neutral">{job.department}</Badge>
          {closed ? (
            <Badge tone="red">Closed</Badge>
          ) : (
            days !== null &&
            days <= 7 && (
              <Badge tone="amber">
                {days === 0 ? "Closes today" : `Closes in ${days} day${days === 1 ? "" : "s"}`}
              </Badge>
            )
          )}
        </div>
      </PageHero>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16 lg:py-20">
        <div>
          <div className="prose-ucc max-w-none">
            <h2>About the role</h2>
            <RichText text={job.description} />

            <h2>What you will do</h2>
            <RichText text={job.responsibilities} />

            <h2>What we are looking for</h2>
            <RichText text={job.requirements} />
          </div>

          <section id="apply" className="mt-14 scroll-mt-28">
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-950">
              Apply for this role
            </h2>

            {closed ? (
              <div className="mt-6 rounded-card border-2 border-navy-100 bg-navy-50/60 p-7">
                <p className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">
                  This vacancy has closed and is no longer accepting applications. We take adverts
                  down rather than leaving them up to collect CVs.
                </p>
                <Link
                  href="/careers"
                  className="mt-4 inline-block text-[0.9375rem] font-bold text-azure-700 underline underline-offset-4"
                >
                  See current vacancies →
                </Link>
              </div>
            ) : (
              <>
                <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
                  Applications close on{" "}
                  <span className="font-bold text-navy-950">{formatDate(job.closes_on)}</span>.
                  Shortlisting happens after that date, so applying early is no advantage — take
                  the time to answer properly.
                </p>
                <div className="mt-8">
                  <JobApplicationForm jobId={job.id} jobTitle={job.title} />
                </div>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-card border-2 border-navy-100 bg-white p-6">
            <h2 className="text-lg font-extrabold text-navy-950">At a glance</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-azure-600" aria-hidden="true" />
                <div>
                  <dt className="font-bold text-navy-500">Location</dt>
                  <dd className="font-semibold text-navy-950">{job.location}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Briefcase className="mt-0.5 size-4 shrink-0 text-azure-600" aria-hidden="true" />
                <div>
                  <dt className="font-bold text-navy-500">Type</dt>
                  <dd className="font-semibold text-navy-950">
                    {EMPLOYMENT_LABELS[job.employment_type]}
                  </dd>
                </div>
              </div>
              {job.salary_range && (
                <div className="flex gap-3">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center text-sm font-extrabold text-azure-600">
                    ₭
                  </span>
                  <div>
                    <dt className="font-bold text-navy-500">Salary</dt>
                    <dd className="font-semibold text-navy-950">{job.salary_range}</dd>
                  </div>
                </div>
              )}
              {job.closes_on && (
                <div className="flex gap-3">
                  <CalendarClock
                    className="mt-0.5 size-4 shrink-0 text-azure-600"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="font-bold text-navy-500">Closing date</dt>
                    <dd className="font-semibold text-navy-950">{formatDate(job.closes_on)}</dd>
                  </div>
                </div>
              )}
            </dl>

            {!closed && (
              <a
                href="#apply"
                className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-full bg-azure-600 px-4 text-sm font-bold text-white transition-colors hover:bg-azure-700"
              >
                Apply now
              </a>
            )}
          </div>

          <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-6">
            <h2 className="text-base font-extrabold text-navy-950">Before you apply</h2>
            <p className="mt-2 text-[0.8125rem] font-medium leading-relaxed text-navy-700">
              This role requires a background check and safeguarding induction before your first
              day. Client confidentiality is absolute, and breaching it is gross misconduct.
            </p>
            <Link
              href="/governance#safeguarding"
              className="mt-3 inline-block text-[0.8125rem] font-bold text-azure-700 underline underline-offset-4"
            >
              Safeguarding policy →
            </Link>
          </div>

          <p className="text-sm font-medium text-navy-600">
            <Link href="/careers" className="font-bold text-azure-700 underline underline-offset-4">
              ← All vacancies
            </Link>
          </p>
        </aside>
      </div>
    </>
  );
}
