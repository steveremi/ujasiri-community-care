"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check } from "lucide-react";

import { subscribeAction } from "@/app/actions/public";
import { emptyFormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-azure-500 text-white transition-colors hover:bg-azure-400 disabled:opacity-60"
      aria-label="Subscribe"
    >
      {pending ? (
        <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <ArrowRight className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}

export function NewsletterForm({
  className,
  source = "footer",
}: {
  className?: string;
  source?: string;
}) {
  const [state, formAction] = useActionState(subscribeAction, emptyFormState);

  if (state.ok) {
    return (
      <p
        className={cn("flex items-start gap-2.5 text-sm text-azure-300", className)}
        role="status"
      >
        <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className={className} noValidate>
      <input type="hidden" name="source" value={source} />
      <div className="flex items-center gap-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 focus-within:ring-azure-400">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(state.errors?.email)}
          className="min-w-0 flex-1 bg-transparent px-3.5 text-sm text-white placeholder:text-navy-400 focus:outline-none"
        />
        <SubmitButton />
      </div>
      {(state.errors?.email || state.message) && (
        <p className="mt-2 text-xs text-azure-400" role="alert">
          {state.errors?.email ?? state.message}
        </p>
      )}
      <p className="mt-2.5 text-xs text-navy-400">
        Monthly. No appeals disguised as news. Unsubscribe in one click.
      </p>
    </form>
  );
}
