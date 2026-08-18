"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Lock, Send } from "lucide-react";

import { submitHrRequestAction } from "@/app/actions/careers";
import { Button } from "@/components/ui/button";
import { emptyFormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border-2 border-navy-200 bg-white px-3.5 py-2.5 text-[0.9375rem] " +
  "font-medium text-navy-950 focus:border-azure-500 focus:outline-none focus:ring-2 " +
  "focus:ring-azure-500/20";

const categories = [
  { value: "leave", label: "Leave request" },
  { value: "reference", label: "Reference letter" },
  { value: "payroll", label: "Payroll query" },
  { value: "equipment", label: "Equipment or supplies" },
  { value: "policy", label: "Policy question" },
  { value: "grievance", label: "Grievance" },
  { value: "general", label: "Something else" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Submitting…
        </>
      ) : (
        <>
          <Send className="size-4" aria-hidden="true" />
          Submit request
        </>
      )}
    </Button>
  );
}

export function HrRequestForm() {
  const [state, formAction] = useActionState(submitHrRequestAction, emptyFormState);
  const [category, setCategory] = useState("leave");

  // A grievance is confidential by default — routing it past the requester's
  // own line manager is the entire point of the flag.
  const forcedConfidential = category === "grievance";

  if (state.ok) {
    return (
      <div className="rounded-xl border-2 border-azure-200 bg-azure-50/60 p-5">
        <p className="flex items-start gap-2.5 text-[0.9375rem] font-medium leading-relaxed text-navy-800">
          <Check className="mt-0.5 size-5 shrink-0 text-azure-700" aria-hidden="true" />
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="block text-sm font-bold text-navy-800">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={cn(inputClass, "mt-1.5")}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-bold text-navy-800">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            className={cn(inputClass, "mt-1.5")}
          />
          {state.errors?.subject && (
            <p className="mt-1.5 text-xs font-bold text-red-600" role="alert">
              {state.errors.subject}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="details" className="block text-sm font-bold text-navy-800">
          Details
        </label>
        <textarea
          id="details"
          name="details"
          required
          rows={5}
          className={cn(inputClass, "mt-1.5 resize-y")}
        />
        {state.errors?.details && (
          <p className="mt-1.5 text-xs font-bold text-red-600" role="alert">
            {state.errors.details}
          </p>
        )}
      </div>

      <label
        className={cn(
          "flex items-start gap-3 rounded-xl border-2 p-4",
          forcedConfidential ? "border-azure-300 bg-azure-50/60" : "border-navy-100",
        )}
      >
        <input
          type="checkbox"
          name="confidential"
          defaultChecked={forcedConfidential}
          disabled={forcedConfidential}
          className="mt-0.5 size-4 shrink-0 rounded border-navy-300 text-azure-600 focus:ring-azure-500"
        />
        <span className="text-[0.9375rem] font-medium leading-relaxed text-navy-700">
          <span className="flex items-center gap-1.5 font-bold text-navy-950">
            <Lock className="size-3.5" aria-hidden="true" />
            Handle this confidentially
          </span>
          Visible only to staff with full HR rights — not to the wider admin group, and not to
          your line manager.
          {forcedConfidential && (
            <span className="mt-1 block text-[0.8125rem] font-semibold text-azure-800">
              Always applied to grievances.
            </span>
          )}
        </span>
      </label>

      {state.message && !state.ok && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
