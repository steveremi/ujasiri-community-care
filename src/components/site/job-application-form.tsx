"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Send } from "lucide-react";

import { applyForJobAction } from "@/app/actions/careers";
import { Button } from "@/components/ui/button";
import { emptyFormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border-2 border-navy-200 bg-white px-3.5 py-2.5 text-[0.9375rem] " +
  "font-medium text-navy-950 placeholder:text-navy-400 focus:border-azure-500 " +
  "focus:outline-none focus:ring-2 focus:ring-azure-500/20";

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-bold text-navy-800">
        {label}
        {required && (
          <span className="ml-1 text-azure-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1.5 text-xs font-medium text-navy-500">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs font-bold text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Submitting…
        </>
      ) : (
        <>
          <Send className="size-4" aria-hidden="true" />
          Submit application
        </>
      )}
    </Button>
  );
}

export function JobApplicationForm({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const [state, formAction] = useActionState(applyForJobAction, emptyFormState);

  if (state.ok) {
    return (
      <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-azure-600 text-white">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-2xl font-extrabold text-navy-950">Application received</h3>
        <p className="mx-auto mt-3 max-w-md text-[0.9375rem] font-medium leading-relaxed text-navy-700">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="jobId" value={jobId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required error={state.errors?.name}>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputClass}
          />
        </Field>

        <Field label="Email" htmlFor="email" required error={state.errors?.email}>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </Field>

        <Field label="Phone" htmlFor="phone" required error={state.errors?.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="0712 345 678"
            className={inputClass}
          />
        </Field>

        <Field
          label="Years of relevant experience"
          htmlFor="yearsExperience"
          error={state.errors?.yearsExperience}
        >
          <input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min={0}
            max={60}
            defaultValue={0}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Link to your CV"
        htmlFor="cvUrl"
        error={state.errors?.cvUrl}
        hint="A shareable Google Drive, Dropbox or OneDrive link. Make sure the link permits access, or we cannot open it."
      >
        <input
          id="cvUrl"
          name="cvUrl"
          type="url"
          placeholder="https://drive.google.com/…"
          className={inputClass}
        />
      </Field>

      <Field
        label={`Why this role, and what you would bring to it`}
        htmlFor="coverLetter"
        required
        error={state.errors?.coverLetter}
        hint="A few paragraphs is plenty. Address the requirements directly — that is what the panel scores against."
      >
        <textarea
          id="coverLetter"
          name="coverLetter"
          required
          rows={9}
          className={cn(inputClass, "resize-y")}
          placeholder={`Tell us why you want to work on ${jobTitle.toLowerCase()} at UCC, and how your experience meets the requirements.`}
        />
      </Field>

      <div className="rounded-xl border-2 border-navy-100 bg-navy-50/60 p-5">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="safeguardingAck"
            required
            className="mt-1 size-4 shrink-0 rounded border-navy-300 text-azure-600 focus:ring-azure-500"
          />
          <span className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">
            I understand that this role requires a satisfactory background check and completion of
            safeguarding induction before starting, that annual safeguarding training is
            mandatory, and that any breach of client confidentiality is treated as gross
            misconduct.
            <span className="ml-1 font-bold text-azure-700" aria-hidden="true">
              *
            </span>
          </span>
        </label>
        {state.errors?.safeguardingAck && (
          <p className="mt-2 text-xs font-bold text-red-600" role="alert">
            {state.errors.safeguardingAck}
          </p>
        )}
      </div>

      {state.message && !state.ok && (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div>
        <SubmitButton />
        <p className="mt-3 text-xs font-medium leading-relaxed text-navy-500">
          We read every application and reply to everyone after the closing date, whether or not
          you are shortlisted. Your details are used only for this recruitment and kept for one
          year if you are unsuccessful.
        </p>
      </div>
    </form>
  );
}
