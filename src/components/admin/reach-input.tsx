"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { updateProgramReachAction } from "@/app/actions/admin";
import { emptyFormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

/**
 * Inline editor for a programme's reach figure.
 *
 * Saves on blur or Enter rather than behind a separate button — the field is
 * the whole interaction, and a save button per row across nine programmes is
 * friction with no benefit.
 *
 * Zero is a meaningful value here, not an empty one: it clears the figure, and
 * the public site then shows nothing for that programme rather than claiming a
 * result. The placeholder says so.
 */
export function ReachInput({
  id,
  value,
  disabled,
}: {
  id: number;
  value: number;
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(updateProgramReachAction, emptyFormState);
  const formRef = useRef<HTMLFormElement>(null);

  // The last value we submitted. Held as state rather than a ref because it
  // drives what renders (the saved tick), and because mutating a ref during an
  // event handler that also triggers a render is exactly the pattern the React
  // compiler flags.
  const [submitted, setSubmitted] = useState(value);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message, { duration: Infinity, closeButton: true });
  }, [state]);

  if (disabled) {
    return (
      <span className="text-sm font-semibold text-navy-500" title="Requires content:edit">
        {value > 0 ? value.toLocaleString("en-KE") : "—"}
      </span>
    );
  }

  /** Submit only when the value actually changed, so tabbing through the
   *  table does not write a row and an audit entry per column. */
  const commit = (raw: string) => {
    const next = Number.parseInt(raw || "0", 10);
    if (!Number.isFinite(next) || next === submitted) return;
    setSubmitted(next);
    formRef.current?.requestSubmit();
  };

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        type="number"
        name="peopleReached"
        min={0}
        defaultValue={value || ""}
        placeholder="Not set"
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={cn(
          "w-32 rounded-lg border-2 border-navy-200 bg-white px-2.5 py-1.5 text-sm font-bold",
          "text-navy-950 tabular-nums placeholder:font-medium placeholder:text-navy-400",
          "focus:border-azure-500 focus:outline-none focus:ring-2 focus:ring-azure-500/20",
        )}
      />
      <SaveIndicator changed={submitted !== value} />
    </form>
  );
}

function SaveIndicator({ changed }: { changed: boolean }) {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <span
        className="size-4 shrink-0 animate-spin rounded-full border-2 border-azure-200 border-t-azure-600"
        aria-label="Saving"
      />
    );
  }
  if (changed) {
    return <Check className="size-4 shrink-0 text-emerald-600" aria-label="Saved" />;
  }
  return null;
}
