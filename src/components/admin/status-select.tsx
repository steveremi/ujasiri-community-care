"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { emptyFormState, type FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

/**
 * Inline status control for admin tables.
 *
 * Submits on change rather than behind a save button: the whole interaction is
 * one decision, and an extra click per row across a queue of forty
 * applications is friction with no upside.
 *
 * The control is disabled while in flight, so a double-change cannot race two
 * writes against each other. If the server refuses — most often because the
 * caller lacks the permission — the select snaps back to its real value, since
 * the page revalidates from the database rather than trusting local state.
 */
export function StatusSelect({
  action,
  id,
  value,
  options,
  disabled,
  disabledReason,
  className,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  id: number | string;
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, emptyFormState);
  const formRef = useRef<HTMLFormElement>(null);

  // Confirmations are brief; refusals stay until dismissed, because a refusal
  // is usually a permission problem the user needs to read and act on.
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message, { duration: Infinity, closeButton: true });
  }, [state]);

  if (disabled) {
    return (
      <span
        className={cn("text-xs font-semibold text-navy-400", className)}
        title={disabledReason}
      >
        {options.find((o) => o.value === value)?.label ?? value}
      </span>
    );
  }

  return (
    <form ref={formRef} action={formAction} className={className}>
      <input type="hidden" name="id" value={id} />
      <SelectControl name="status" value={value} options={options} formRef={formRef} />
    </form>
  );
}

function SelectControl({
  name,
  value,
  options,
  formRef,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  formRef: React.RefObject<HTMLFormElement | null>;
}) {
  const { pending } = useFormStatus();

  return (
    <select
      name={name}
      defaultValue={value}
      disabled={pending}
      onChange={() => formRef.current?.requestSubmit()}
      aria-label="Change status"
      className={cn(
        "rounded-full border-2 border-navy-200 bg-white px-2.5 py-1 text-xs font-bold capitalize",
        "text-navy-800 transition-colors focus:border-azure-500 focus:outline-none",
        "focus:ring-2 focus:ring-azure-500/20 disabled:opacity-50",
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Status option sets, matching the enums the server actions validate against. */
export const STATUS_OPTIONS = {
  donation: [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ],
  volunteer: [
    { value: "new", label: "New" },
    { value: "reviewing", label: "Reviewing" },
    { value: "accepted", label: "Accepted" },
    { value: "declined", label: "Declined" },
  ],
  message: [
    { value: "new", label: "New" },
    { value: "in_progress", label: "In progress" },
    { value: "resolved", label: "Resolved" },
  ],
  application: [
    { value: "received", label: "Received" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offered", label: "Offered" },
    { value: "rejected", label: "Rejected" },
    { value: "withdrawn", label: "Withdrawn" },
  ],
  job: [
    { value: "draft", label: "Draft" },
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
    { value: "filled", label: "Filled" },
  ],
  hr: [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In progress" },
    { value: "resolved", label: "Resolved" },
    { value: "declined", label: "Declined" },
  ],
  post: [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ],
} as const;
