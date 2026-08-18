"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Send } from "lucide-react";

import { contactAction } from "@/app/actions/public";
import { Button } from "@/components/ui/button";
import { emptyFormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border-2 border-navy-200 bg-white px-3.5 py-2.5 text-[0.9375rem] " +
  "font-medium text-navy-950 placeholder:text-navy-400 focus:border-azure-500 " +
  "focus:outline-none focus:ring-2 focus:ring-azure-500/20";

const topics = [
  { value: "general", label: "General enquiry" },
  { value: "services", label: "Accessing a service" },
  { value: "partnership", label: "Partnership or referral" },
  { value: "media", label: "Media enquiry" },
  { value: "donation", label: "Donations and giving" },
  { value: "reports", label: "Request our accounts or policies" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Sending…
        </>
      ) : (
        <>
          <Send className="size-4" aria-hidden="true" />
          Send message
        </>
      )}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(contactAction, emptyFormState);

  if (state.ok) {
    return (
      <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-azure-600 text-white">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-navy-950">Message sent</h2>
        <p className="mx-auto mt-3 max-w-md text-[0.9375rem] font-medium leading-relaxed text-navy-700">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Deliberately no health fields. A web form is the wrong place for a
          diagnosis or a disclosure of violence, and storing one here would
          create a record that could put someone at risk. */}
      <div className="rounded-xl border-2 border-azure-200 bg-azure-50/60 px-4 py-3">
        <p className="text-[0.8125rem] font-medium leading-relaxed text-navy-700">
          <span className="font-bold">Please don&apos;t use this form for anything sensitive.</span>{" "}
          If you need to talk about your health or something that has happened to you, call us
          instead — this form is not a confidential channel.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-navy-800">
            Your name
          </label>
          <input id="name" name="name" type="text" required autoComplete="name" className={cn(inputClass, "mt-1.5")} />
          {state.errors?.name && (
            <p className="mt-1.5 text-xs font-bold text-red-600" role="alert">{state.errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-navy-800">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={cn(inputClass, "mt-1.5")} />
          {state.errors?.email && (
            <p className="mt-1.5 text-xs font-bold text-red-600" role="alert">{state.errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="topic" className="block text-sm font-bold text-navy-800">
          What is this about?
        </label>
        <select id="topic" name="topic" defaultValue="general" className={cn(inputClass, "mt-1.5")}>
          {topics.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-bold text-navy-800">
          Subject
        </label>
        <input id="subject" name="subject" type="text" className={cn(inputClass, "mt-1.5")} />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-bold text-navy-800">
          Message
        </label>
        <textarea id="message" name="message" required rows={7} className={cn(inputClass, "mt-1.5 resize-y")} />
        {state.errors?.message && (
          <p className="mt-1.5 text-xs font-bold text-red-600" role="alert">{state.errors.message}</p>
        )}
      </div>

      {state.message && !state.ok && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
          {state.message}
        </p>
      )}

      <div>
        <SubmitButton />
        <p className="mt-3 text-xs font-medium text-navy-500">
          We reply within two working days. Urgent matters should go to the phone numbers above.
        </p>
      </div>
    </form>
  );
}
