"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Send } from "lucide-react";

import { volunteerAction } from "@/app/actions/public";
import { Button } from "@/components/ui/button";
import { emptyFormState } from "@/lib/form-state";
import type { Program } from "@/lib/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border-2 border-navy-200 bg-white px-3.5 py-2.5 text-[0.9375rem] " +
  "font-medium text-navy-950 placeholder:text-navy-400 focus:border-azure-500 " +
  "focus:outline-none focus:ring-2 focus:ring-azure-500/20";

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
          Submit application
        </>
      )}
    </Button>
  );
}

export function VolunteerForm({ programs }: { programs: Program[] }) {
  const [state, formAction] = useActionState(volunteerAction, emptyFormState);

  if (state.ok) {
    return (
      <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-azure-600 text-white">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-navy-950">Application received</h2>
        <p className="mx-auto mt-3 max-w-md text-[0.9375rem] font-medium leading-relaxed text-navy-700">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-navy-800">Full name</label>
          <input id="name" name="name" type="text" required autoComplete="name" className={cn(inputClass, "mt-1.5")} />
          {state.errors?.name && <p className="mt-1.5 text-xs font-bold text-red-600" role="alert">{state.errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-navy-800">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={cn(inputClass, "mt-1.5")} />
          {state.errors?.email && <p className="mt-1.5 text-xs font-bold text-red-600" role="alert">{state.errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-navy-800">Phone</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="0712 345 678" className={cn(inputClass, "mt-1.5")} />
        </div>
        <div>
          <label htmlFor="programId" className="block text-sm font-bold text-navy-800">Which programme interests you?</label>
          <select id="programId" name="programId" defaultValue="" className={cn(inputClass, "mt-1.5")}>
            <option value="">Wherever you need me</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-bold text-navy-800">Skills and experience</label>
        <textarea id="skills" name="skills" rows={3} className={cn(inputClass, "mt-1.5 resize-y")} placeholder="Languages you speak, qualifications, anything relevant." />
      </div>

      <div>
        <label htmlFor="availability" className="block text-sm font-bold text-navy-800">Availability</label>
        <input id="availability" name="availability" type="text" className={cn(inputClass, "mt-1.5")} placeholder="e.g. two weekday afternoons, or Saturdays" />
      </div>

      <div>
        <label htmlFor="motivation" className="block text-sm font-bold text-navy-800">Why do you want to volunteer with us?</label>
        <textarea id="motivation" name="motivation" required rows={6} className={cn(inputClass, "mt-1.5 resize-y")} />
        {state.errors?.motivation && <p className="mt-1.5 text-xs font-bold text-red-600" role="alert">{state.errors.motivation}</p>}
      </div>

      {state.message && !state.ok && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">{state.message}</p>
      )}

      <div>
        <SubmitButton />
        <p className="mt-3 text-xs font-medium leading-relaxed text-navy-500">
          All volunteer roles require a satisfactory background check and completion of
          safeguarding induction before you start.
        </p>
      </div>
    </form>
  );
}
