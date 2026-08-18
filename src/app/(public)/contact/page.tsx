import type { Metadata } from "next";
import { Clock, Mail, MapPin, ShieldCheck } from "lucide-react";

import { ContactForm } from "@/components/site/contact-form";
import { PageHero } from "@/components/site/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Get in touch with Ujasiri Community Care in Nanyuki, Kenya — general enquiries, partnerships, media, and requests for our accounts and policies.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Get in touch"
        lead="For anything urgent, or anything to do with your own health or safety, please call rather than email — the phone is confidential and the form is not."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-20">
        <aside className="space-y-6">
          <div className="rounded-card border-2 border-navy-100 p-7">
            <h2 className="text-xl font-extrabold text-navy-950">Customer care</h2>
            <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
              General enquiries, donations, partnerships and anything administrative.
            </p>
            <ul className="mt-5 space-y-2.5">
              {site.customerCare.lines.map((number) => (
                <li key={number}>
                  <a
                    href={`tel:${number.replace(/\s/g, "")}`}
                    className="text-xl font-extrabold text-navy-950 transition-colors hover:text-azure-700"
                  >
                    {number}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 border-t border-navy-100 pt-3 text-sm font-medium text-navy-600">
              <Clock className="size-4 shrink-0 text-azure-600" aria-hidden="true" />
              {site.customerCare.hours}
            </p>
          </div>

          <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-7">
            <h2 className="text-xl font-extrabold text-navy-950">Support hotline</h2>
            <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
              For anything to do with your health or safety. Confidential.
            </p>
            <ul className="mt-5 space-y-4">
              {site.help.lines.map((line) => (
                <li key={line.label}>
                  <a href={`tel:${line.number.replace(/\s/g, "")}`} className="group block">
                    <span className="block text-xs font-bold uppercase tracking-wide text-navy-500">
                      {line.label}
                    </span>
                    <span className="block text-xl font-extrabold text-navy-950 group-hover:text-azure-700">
                      {line.number}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-navy-500">
                      <Clock className="size-3" aria-hidden="true" />
                      {line.note}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border-2 border-navy-100 p-7">
            <h2 className="text-xl font-extrabold text-navy-950">Visit or write</h2>
            <address className="mt-4 space-y-4 text-[0.9375rem] font-medium not-italic text-navy-700">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-azure-600" aria-hidden="true" />
                <span>
                  {site.contact.address.street}
                  <br />
                  {site.contact.address.locality}, {site.contact.address.postalCode}
                  <br />
                  {site.contact.address.region}, {site.contact.address.countryName}
                </span>
              </p>
              <p className="flex gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-azure-600" aria-hidden="true" />
                <span>
                  <a href={`mailto:${site.contact.email}`} className="font-bold text-azure-700 underline underline-offset-4">
                    {site.contact.email}
                  </a>
                  <br />
                  <span className="text-sm">General enquiries</span>
                </span>
              </p>
              <p className="flex gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-azure-600" aria-hidden="true" />
                <span>
                  <a href={`mailto:${site.contact.supportEmail}`} className="font-bold text-azure-700 underline underline-offset-4">
                    {site.contact.supportEmail}
                  </a>
                  <br />
                  <span className="text-sm">Donations and giving</span>
                </span>
              </p>
              <p className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-azure-600" aria-hidden="true" />
                <span>{site.contact.hours}</span>
              </p>
            </address>
          </div>

          <div className="rounded-card border-2 border-navy-100 bg-navy-50/60 p-7">
            <ShieldCheck className="size-5 text-azure-600" aria-hidden="true" />
            <h2 className="mt-3 text-base font-extrabold text-navy-950">Raising a concern</h2>
            <p className="mt-2 text-[0.8125rem] font-medium leading-relaxed text-navy-600">
              Concerns about the conduct of our staff or volunteers go straight to our board, not
              to management. You can report anonymously.
            </p>
            <a
              href={`mailto:${site.contact.safeguardingEmail}`}
              className="mt-3 inline-block text-[0.8125rem] font-bold text-azure-700 underline underline-offset-4"
            >
              {site.contact.safeguardingEmail}
            </a>
          </div>
        </aside>

        <div className="rounded-card border-2 border-navy-100 bg-white p-7 shadow-card sm:p-9">
          <h2 className="text-2xl font-extrabold text-navy-950">Send us a message</h2>
          <p className="mt-2 text-[0.9375rem] font-medium text-navy-600">
            We read everything and reply within two working days.
          </p>
          <div className="mt-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
