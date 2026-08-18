"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Save } from "lucide-react";
import { toast } from "sonner";

import { updateOrgSettingsAction } from "@/app/actions/admin";
import { emptyFormState } from "@/lib/form-state";
import type { OrgSettings } from "@/lib/repos/settings";
import { cn } from "@/lib/utils";

/**
 * Organisation settings editor.
 *
 * Everything here appears across the whole public site, so the form is
 * grouped the way a person thinks about it — identity, registration, contact,
 * hotlines — rather than the way the record is stored.
 *
 * The hotlines are three parallel line-separated lists rather than a repeating
 * field group. That is a deliberate trade: it is less pretty, but it is
 * editable by anyone who can use a text box, and it cannot get into the broken
 * intermediate states that dynamic add/remove rows produce.
 */

const input =
  "w-full rounded-lg border-2 border-navy-200 bg-white px-3 py-2 text-sm font-medium " +
  "text-navy-950 placeholder:font-normal placeholder:text-navy-400 focus:border-azure-500 " +
  "focus:outline-none focus:ring-2 focus:ring-azure-500/20 disabled:opacity-50";

function Field({
  label,
  name,
  defaultValue,
  hint,
  type = "text",
  rows,
  required,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  type?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-xs font-bold uppercase tracking-wide text-navy-600">
        {label}
      </span>
      {rows ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={rows}
          required={required}
          className={cn(input, "mt-1.5 resize-y")}
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          className={cn(input, "mt-1.5")}
        />
      )}
      {hint && <span className="mt-1 block text-xs font-medium text-navy-500">{hint}</span>}
    </label>
  );
}

function Group({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border-2 border-navy-100 bg-white p-6 shadow-card">
      <h2 className="text-lg font-extrabold text-navy-950">{title}</h2>
      {description && (
        <p className="mt-1.5 text-[0.8125rem] font-medium leading-relaxed text-navy-600">
          {description}
        </p>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function SubmitBar({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 -mx-6 mt-2 flex items-center justify-between gap-4 border-t-2 border-navy-100 bg-white/95 px-6 py-4 backdrop-blur lg:-mx-8 lg:px-8">
      <p className="text-xs font-medium text-navy-500">
        These appear across the whole public site. Saving revalidates every page.
      </p>
      <button
        type="submit"
        disabled={pending || !dirty}
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-bold transition-colors",
          dirty ? "bg-azure-600 text-white hover:bg-azure-700" : "bg-navy-50 text-navy-400",
          "disabled:pointer-events-none",
        )}
      >
        {pending ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Saving
          </>
        ) : dirty ? (
          <>
            <Save className="size-4" aria-hidden="true" />
            Save changes
          </>
        ) : (
          <>
            <Check className="size-4" aria-hidden="true" />
            Saved
          </>
        )}
      </button>
    </div>
  );
}

export function SettingsForm({ settings }: { settings: OrgSettings }) {
  const [state, formAction] = useActionState(updateOrgSettingsAction, emptyFormState);
  const [dirty, setDirty] = useState(false);

  // Derived during render rather than in an effect — clearing the flag after a
  // save is state driven by other state, and an effect would cost a second
  // render pass every time.
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.ok) setDirty(false);
  }

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message, { duration: Infinity, closeButton: true });
  }, [state]);

  const help = settings.help.lines;

  return (
    <form action={formAction} onChange={() => setDirty(true)} className="space-y-6">
      <Group
        title="Identity"
        description="The organisation's name and how it describes itself. Used in the header, the footer, page titles and the structured data search engines read."
      >
        <Field label="Name" name="name" defaultValue={settings.name} required />
        <Field
          label="Short name"
          name="shortName"
          defaultValue={settings.shortName}
          hint="Shown in the logo and appended to page titles."
          required
        />
        <Field label="Legal name" name="legalName" defaultValue={settings.legalName} required />
        <Field label="Founded" name="founded" defaultValue={settings.founded} required />
        <Field label="Tagline" name="tagline" defaultValue={settings.tagline} className="sm:col-span-2" />
        <Field
          label="Mission"
          name="mission"
          defaultValue={settings.mission}
          rows={3}
          className="sm:col-span-2"
          hint="One sentence a first-time visitor should be able to act on. Appears in the footer."
        />
        <Field
          label="Description"
          name="description"
          defaultValue={settings.description}
          rows={3}
          className="sm:col-span-2"
          hint="Used as the default meta description and in search results."
        />
      </Group>

      <Group
        title="Registration"
        description="The single strongest trust signal on the site — a sceptical donor can check these against a public register. Keep them exact."
      >
        <Field label="Registration label" name="regLabel" defaultValue={settings.registration.label} />
        <Field label="Registration number" name="regNumber" defaultValue={settings.registration.number} />
        <Field
          label="Registering authority"
          name="regAuthority"
          defaultValue={settings.registration.authority}
          className="sm:col-span-2"
        />
        <Field label="Tax exemption label" name="taxLabel" defaultValue={settings.registration.taxLabel} />
        <Field label="Tax exemption number" name="taxNumber" defaultValue={settings.registration.taxNumber} />
      </Group>

      <Group title="Contact">
        <Field label="General email" name="email" type="email" defaultValue={settings.contact.email} required />
        <Field label="Donations email" name="supportEmail" type="email" defaultValue={settings.contact.supportEmail} required />
        <Field
          label="Safeguarding email"
          name="safeguardingEmail"
          type="email"
          defaultValue={settings.contact.safeguardingEmail}
          hint="Goes to a trustee, not to management."
          required
          className="sm:col-span-2"
        />
        <Field label="Street" name="street" defaultValue={settings.contact.address.street} className="sm:col-span-2" />
        <Field label="Town or city" name="locality" defaultValue={settings.contact.address.locality} />
        <Field label="County" name="region" defaultValue={settings.contact.address.region} />
        <Field label="Postal code" name="postalCode" defaultValue={settings.contact.address.postalCode} />
        <Field label="Country" name="countryName" defaultValue={settings.contact.address.countryName} />
        <Field label="Office hours" name="hours" defaultValue={settings.contact.hours} className="sm:col-span-2" />
      </Group>

      <Group
        title="Customer care"
        description="General enquiries, donations and partnerships. Not the crisis hotline."
      >
        <Field
          label="Numbers"
          name="careLines"
          defaultValue={settings.customerCare.lines.join("\n")}
          rows={3}
          hint="One per line, in the order they should be tried."
        />
        <Field label="Hours" name="careHours" defaultValue={settings.customerCare.hours} />
      </Group>

      <Group
        title="Crisis hotlines"
        description="Shown in the header strip, the footer and every support page. At least one number is required — a site covering HIV and gender-based violence must never render a page with no number to call."
      >
        <Field
          label="Urgent note"
          name="urgentNote"
          defaultValue={settings.help.urgentNote}
          rows={3}
          className="sm:col-span-2"
          hint="Time-critical safety information, shown above everything else on support pages."
        />
        <Field
          label="Labels"
          name="hotlineLabels"
          defaultValue={help.map((l) => l.label).join("\n")}
          rows={4}
          hint="One per line."
        />
        <Field
          label="Numbers"
          name="hotlineNumbers"
          defaultValue={help.map((l) => l.number).join("\n")}
          rows={4}
          hint="One per line, matching the labels."
        />
        <Field
          label="Notes"
          name="hotlineNotes"
          defaultValue={help.map((l) => l.note).join("\n")}
          rows={4}
          className="sm:col-span-2"
          hint="One per line — e.g. hours, or whether the line is free."
        />
      </Group>

      <SubmitBar dirty={dirty} />
    </form>
  );
}
