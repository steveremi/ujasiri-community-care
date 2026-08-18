"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Lock, ShieldCheck } from "lucide-react";

import { donateAction } from "@/app/actions/donate";
import { emptyDonateState } from "@/lib/form-state";
import {
  AirtelMark,
  MastercardMark,
  MpesaMark,
  PaypalMark,
  VisaMark,
} from "@/components/payments/payment-marks";
import { Button } from "@/components/ui/button";
import { GIVING_TIERS, MONTHLY_TIERS, type ProviderId } from "@/lib/payments/providers";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const providerOptions: {
  id: ProviderId;
  name: string;
  blurb: string;
  Marks: React.FC<{ className?: string }>[];
  recurring: boolean;
}[] = [
  { id: "mpesa", name: "M-Pesa", blurb: "STK push to your phone", Marks: [MpesaMark], recurring: false },
  { id: "airtel", name: "Airtel Money", blurb: "Approve on your phone", Marks: [AirtelMark], recurring: false },
  {
    id: "stripe",
    name: "Card or bank",
    blurb: "Visa, Mastercard, bank transfer",
    Marks: [VisaMark, MastercardMark],
    recurring: true,
  },
  { id: "paypal", name: "PayPal", blurb: "Balance or card", Marks: [PaypalMark], recurring: true },
];

function SubmitButton({ amount }: { amount: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Processing…
        </>
      ) : (
        <>
          <Lock className="size-4" aria-hidden="true" />
          Give KES {amount.toLocaleString("en-KE")}
        </>
      )}
    </Button>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-navy-800">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1.5 text-xs text-navy-500">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-[0.9375rem] text-navy-950 " +
  "placeholder:text-navy-400 focus:border-azure-500 focus:outline-none focus:ring-2 focus:ring-azure-500/20";

export function DonateForm({ projects }: { projects: Project[] }) {
  const [state, formAction] = useActionState(donateAction, emptyDonateState);
  const [frequency, setFrequency] = useState<"one_off" | "monthly">("one_off");
  const [provider, setProvider] = useState<ProviderId>("mpesa");
  const [amount, setAmount] = useState<number>(2000);
  const [custom, setCustom] = useState("");

  const tiers = frequency === "monthly" ? MONTHLY_TIERS : GIVING_TIERS;
  const activeTier = tiers.find((t) => t.amount === amount);
  const needsPhone = provider === "mpesa" || provider === "airtel";

  // Monthly is only possible on rails that can hold a mandate.
  const availableProviders = providerOptions.filter(
    (p) => frequency === "one_off" || p.recurring,
  );

  if (state.ok) {
    return (
      <div className="rounded-card border border-azure-200 bg-azure-50/60 p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-azure-600 text-white">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-navy-950">Thank you</h2>
        <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-navy-700">
          {state.message}
        </p>
        {state.reference && (
          <p className="mt-4 font-mono text-sm text-navy-600">
            Reference: <span className="font-semibold text-navy-900">{state.reference}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-7" noValidate>
      <input type="hidden" name="frequency" value={frequency} />
      <input type="hidden" name="provider" value={provider} />
      <input type="hidden" name="amount" value={amount} />

      {/* Frequency ---------------------------------------------------- */}
      <fieldset>
        <legend className="text-sm font-semibold text-navy-900">How often?</legend>
        <div
          role="radiogroup"
          aria-label="Giving frequency"
          className="mt-3 grid grid-cols-2 gap-1.5 rounded-full bg-navy-50 p-1.5"
        >
          {(
            [
              ["one_off", "Give once"],
              ["monthly", "Give monthly"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={frequency === value}
              onClick={() => {
                setFrequency(value);
                // Switching to monthly may invalidate a mobile-money choice.
                if (value === "monthly" && !["stripe", "paypal"].includes(provider)) {
                  setProvider("stripe");
                }
                setAmount(value === "monthly" ? 1000 : 2000);
                setCustom("");
              }}
              className={cn(
                "rounded-full py-2.5 text-sm font-semibold transition-colors",
                frequency === value
                  ? "bg-white text-navy-950 shadow-sm"
                  : "text-navy-600 hover:text-navy-900",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {frequency === "monthly" && (
          <p className="mt-2.5 text-xs leading-relaxed text-navy-600">
            Monthly giving is what lets us promise someone a follow-up call six months from
            now. Cancel any time.
          </p>
        )}
      </fieldset>

      {/* Amount ------------------------------------------------------- */}
      <fieldset>
        <legend className="text-sm font-semibold text-navy-900">How much?</legend>
        <div role="radiogroup" aria-label="Amount" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {tiers.map((tier) => (
            <button
              key={tier.amount}
              type="button"
              role="radio"
              aria-checked={amount === tier.amount && custom === ""}
              onClick={() => {
                setAmount(tier.amount);
                setCustom("");
              }}
              className={cn(
                "rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors",
                amount === tier.amount && custom === ""
                  ? "border-azure-600 bg-azure-50 text-azure-900"
                  : "border-navy-100 bg-white text-navy-800 hover:border-navy-300",
              )}
            >
              {tier.label}
            </button>
          ))}
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="custom-amount" className="sr-only">
              Other amount in Kenyan shillings
            </label>
            <input
              id="custom-amount"
              type="number"
              inputMode="numeric"
              min={50}
              placeholder="Other"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                const n = Number.parseInt(e.target.value, 10);
                if (Number.isFinite(n) && n > 0) setAmount(n);
              }}
              className={cn(
                "h-full w-full rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold",
                "focus:outline-none focus:ring-2 focus:ring-azure-500/20",
                custom !== ""
                  ? "border-azure-600 bg-azure-50 text-azure-900"
                  : "border-navy-100 text-navy-800 focus:border-azure-500",
              )}
            />
          </div>
        </div>

        {activeTier && custom === "" && (
          <p className="mt-3 rounded-xl bg-navy-50 px-4 py-3 text-[0.8125rem] leading-relaxed text-navy-700">
            <span className="font-semibold text-navy-900">What this does: </span>
            {activeTier.impact}
          </p>
        )}
        {state.errors?.amount && (
          <p className="mt-2 text-xs font-medium text-red-600" role="alert">
            {state.errors.amount}
          </p>
        )}
      </fieldset>

      {/* Designation -------------------------------------------------- */}
      <Field
        label="Where should it go?"
        htmlFor="projectId"
        hint="Unrestricted gifts are the most useful — they let us move money to whichever programme needs it most."
      >
        <select id="projectId" name="projectId" defaultValue="" className={inputClass}>
          <option value="">Wherever the need is greatest</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </Field>

      {/* Payment method ------------------------------------------------ */}
      <fieldset>
        <legend className="text-sm font-semibold text-navy-900">How would you like to pay?</legend>
        <div role="radiogroup" aria-label="Payment method" className="mt-3 grid gap-2 sm:grid-cols-2">
          {availableProviders.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={provider === option.id}
              onClick={() => setProvider(option.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-colors",
                provider === option.id
                  ? "border-azure-600 bg-azure-50/60"
                  : "border-navy-100 bg-white hover:border-navy-300",
              )}
            >
              <span className="flex shrink-0 gap-1">
                {option.Marks.map((Mark, i) => (
                  <Mark key={i} className="h-7 w-auto" />
                ))}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-navy-950">{option.name}</span>
                <span className="block text-xs text-navy-500">{option.blurb}</span>
              </span>
            </button>
          ))}
        </div>
        {state.errors?.provider && (
          <p className="mt-2 text-xs font-medium text-red-600" role="alert">
            {state.errors.provider}
          </p>
        )}
      </fieldset>

      {/* Donor details ------------------------------------------------- */}
      <div className="space-y-4">
        {needsPhone && (
          <Field
            label="Mobile number"
            htmlFor="phone"
            error={state.errors?.phone}
            hint="We'll send the payment request to this number."
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0712 345 678"
              className={inputClass}
            />
          </Field>
        )}

        <Field label="Your name" htmlFor="name" error={state.errors?.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Wanjiru"
            className={inputClass}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="email"
          error={state.errors?.email}
          hint="For your receipt. We will not add you to anything without asking."
        >
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>

        <label className="flex items-start gap-3 text-sm text-navy-700">
          <input
            type="checkbox"
            name="isAnonymous"
            className="mt-0.5 size-4 rounded border-navy-300 text-azure-600 focus:ring-azure-500"
          />
          <span>Give anonymously — don&apos;t show my name in any donor listing.</span>
        </label>
      </div>

      {state.message && !state.ok && (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div>
        <SubmitButton amount={amount} />
        <p className="mt-3.5 flex items-start gap-2 text-xs leading-relaxed text-navy-500">
          <ShieldCheck className="mt-px size-4 shrink-0 text-azure-600" aria-hidden="true" />
          <span>
            Your payment is handled by the provider you choose. We never see or store your card
            or M-Pesa PIN. A receipt is emailed to you immediately.
          </span>
        </p>
      </div>
    </form>
  );
}
