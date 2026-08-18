import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone, ShieldAlert } from "lucide-react";

import { AfterHoursLines } from "@/components/site/after-hours-lines";
import { Logo } from "@/components/site/logo";
import { NewsletterForm } from "@/components/site/newsletter-form";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/site/social-icons";
import { getSettings } from "@/lib/repos/settings";
import { footerNav } from "@/lib/site";

/**
 * Site footer.
 *
 * Colour note: body text here is white at reduced opacity, never the navy
 * tints from the brand scale. navy-200 and navy-300 are pale *blues*, and
 * setting them on a navy ground produces a monochrome wash with no clear
 * hierarchy. White at 60–70% against navy-950 reads crisply, keeps contrast
 * above WCAG AA, and lets azure stay meaningful as the one accent colour.
 */

/** Icons are static; the URLs come from settings at request time. */
const socialIcons = [
  { key: "twitter", label: "Twitter", Icon: TwitterIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
] as const;

export async function Footer() {
  const year = new Date().getFullYear();
  const site = await getSettings();

  const socialLinks = socialIcons
    .map((s) => ({ ...s, href: (site.social as Record<string, string>)[s.key] }))
    .filter((s) => Boolean(s.href));

  return (
    <footer className="mt-auto bg-navy-950 text-white/70">
      {/* A single azure hairline marks the boundary between page and footer —
          enough separation without another heavy border. */}
      <div className="h-px bg-gradient-to-r from-transparent via-azure-500/60 to-transparent" />

      {/* --------------------------------------------------- Help, first ---- */}
      <div className="border-b border-white/10 bg-white/[0.03]">
        <div className="container-page py-8">
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
            <div className="flex items-start gap-3.5">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-azure-500 text-navy-950">
                <ShieldAlert className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-base font-extrabold text-white">Need help right now?</p>
                <p className="mt-0.5 text-sm font-medium text-white/60">
                  Free, confidential, and nobody is told anything.
                </p>
              </div>
            </div>

            <ul className="flex flex-wrap items-center gap-2.5">
              {site.help.lines.map((line, i) => (
                <li key={line.number}>
                  <a
                    href={`tel:${line.number.replace(/\s/g, "")}`}
                    className={
                      i === 0
                        ? "inline-flex h-11 items-center gap-2 rounded-full bg-azure-500 px-5 text-sm font-bold text-navy-950 transition-colors hover:bg-azure-400"
                        : "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10"
                    }
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    {line.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <AfterHoursLines variant="inline" className="mt-5 text-sm" />
        </div>
      </div>

      {/* ------------------------------------------- Identity & newsletter --- */}
      <div className="border-b border-white/10">
        <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <Logo invert />
            <p className="mt-6 max-w-lg text-[0.9375rem] font-medium leading-relaxed text-white/70">
              {site.mission}
            </p>

            <p className="mt-7 text-xs font-medium leading-relaxed text-white/45">
              A non-governmental organisation registered in Kenya with the{" "}
              {site.registration.authority} ({site.registration.number}), holding tax exemption{" "}
              {site.registration.taxNumber}. Donations are tax deductible.
            </p>
          </div>

          <div className="rounded-card bg-white/[0.05] p-7 ring-1 ring-white/10">
            <h2 className="text-xl font-extrabold text-white">Our work, reported honestly</h2>
            <p className="mt-2.5 text-sm font-medium leading-relaxed text-white/65">
              A short update every month: what we achieved, what we spent, and what did not work.
              No appeals disguised as news.
            </p>
            <NewsletterForm className="mt-6" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- Navigation -- */}
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        {footerNav.map((group) => (
          <nav key={group.title} aria-labelledby={`footer-${group.title}`}>
            <h2
              id={`footer-${group.title}`}
              className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-azure-300"
            >
              {group.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-white/65 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* --------------------------------------------- Contact & concerns ---- */}
      <div className="border-t border-white/10">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-3">
          <div>
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-azure-300">
              Visit or write
            </h2>
            <address className="mt-4 space-y-3 text-sm font-medium not-italic text-white/70">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-azure-400" aria-hidden="true" />
                <span>
                  {site.contact.address.street}
                  <br />
                  {site.contact.address.locality}, {site.contact.address.postalCode}
                  <br />
                  {site.contact.address.region}, {site.contact.address.countryName}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-azure-400" aria-hidden="true" />
                <a href={`mailto:${site.contact.email}`} className="hover:text-white">
                  {site.contact.email}
                </a>
              </p>
            </address>
          </div>

          <div>
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-azure-300">
              Customer care
            </h2>
            <p className="mt-4 text-sm font-medium text-white/60">
              Enquiries, donations and partnerships.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {site.customerCare.lines.map((number) => (
                <li key={number}>
                  <a
                    href={`tel:${number.replace(/\s/g, "")}`}
                    className="font-bold text-white transition-colors hover:text-azure-300"
                  >
                    {number}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-white/50">
              <Clock className="size-3.5 shrink-0 text-azure-400" aria-hidden="true" />
              {site.customerCare.hours}
            </p>
          </div>

          <div>
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-azure-300">
              Raise a concern
            </h2>
            <p className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-white/70">
              Any concern about our staff or volunteers can be reported confidentially — including
              anonymously — and reaches our board directly, not our management.
            </p>
            <a
              href={`mailto:${site.contact.safeguardingEmail}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-azure-300 underline-offset-4 hover:underline"
            >
              {site.contact.safeguardingEmail}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>

            <ul className="mt-7 flex gap-2">
              {socialLinks.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-full bg-white/[0.06] text-white/70 ring-1 ring-white/10 transition-colors hover:bg-azure-500 hover:text-navy-950 hover:ring-azure-400"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------ Small print -- */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container-page flex flex-col gap-3 py-6 text-xs font-medium text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. A registered non-governmental organisation in Kenya.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/accessibility" className="hover:text-white">
              Accessibility
            </Link>
            <span>
              Built by{" "}
              <a
                href={site.poweredBy.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-bold text-white/70 underline-offset-4 hover:text-white hover:underline"
              >
                {site.poweredBy.name}
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
