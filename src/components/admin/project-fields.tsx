"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Save } from "lucide-react";
import { toast } from "sonner";

import { updateProjectDetailsAction } from "@/app/actions/admin";
import { emptyFormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

/**
 * Editor for a project's publishable details.
 *
 * Everything here appears on the public site, so the form makes the
 * consequence explicit rather than assuming the person filling it in knows.
 * Blank is a valid answer for every field: the site omits what has not been
 * recorded rather than inventing a placeholder.
 *
 * Unlike the reach figure, this saves behind a button. These are several
 * related fields edited together, and blur-to-save would fire a write and an
 * audit entry every time somebody tabbed between them.
 */

const input =
  "w-full rounded-lg border-2 border-navy-200 bg-white px-3 py-2 text-sm font-medium " +
  "text-navy-950 placeholder:font-normal placeholder:text-navy-400 focus:border-azure-500 " +
  "focus:outline-none focus:ring-2 focus:ring-azure-500/20 disabled:opacity-50";

function SubmitButton({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || !dirty}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors",
        dirty
          ? "bg-azure-600 text-white hover:bg-azure-700"
          : "bg-navy-50 text-navy-400",
        "disabled:pointer-events-none",
      )}
    >
      {pending ? (
        <>
          <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Saving
        </>
      ) : dirty ? (
        <>
          <Save className="size-3.5" aria-hidden="true" />
          Save
        </>
      ) : (
        <>
          <Check className="size-3.5" aria-hidden="true" />
          Saved
        </>
      )}
    </button>
  );
}

export function ProjectFields({
  project,
  disabled,
}: {
  project: {
    id: number;
    title: string;
    funder: string;
    funder_url: string | null;
    target: string;
    reporting_line: string;
    cover_image: string | null;
    beneficiaries: number;
  };
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(updateProjectDetailsAction, emptyFormState);
  const [dirty, setDirty] = useState(false);

  // Clearing the dirty flag on a successful save is a state adjustment derived
  // from another piece of state, so it belongs in the render phase. Doing it in
  // an effect would schedule a second render pass after every save.
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    setSeenState(state);
    if (state.ok) setDirty(false);
  }

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message, { duration: Infinity, closeButton: true });
  }, [state]);

  if (disabled) {
    return (
      <p className="text-sm font-medium text-navy-500">
        Read-only — editing projects requires <code className="font-mono text-xs">content:edit</code>.
      </p>
    );
  }

  return (
    <form action={formAction} onChange={() => setDirty(true)} className="space-y-4">
      <input type="hidden" name="id" value={project.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wide text-navy-600">
            Funder
          </span>
          <input
            name="funder"
            type="text"
            defaultValue={project.funder}
            placeholder="Leave blank if not named publicly"
            className={cn(input, "mt-1.5")}
          />
        </label>

        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wide text-navy-600">
            Funder website
          </span>
          <input
            name="funderUrl"
            type="url"
            defaultValue={project.funder_url ?? ""}
            placeholder="https://…"
            className={cn(input, "mt-1.5")}
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wide text-navy-600">
          Commitment
        </span>
        <input
          name="target"
          type="text"
          defaultValue={project.target}
          placeholder="e.g. 4,600 girls across 24 schools"
          className={cn(input, "mt-1.5")}
        />
        <span className="mt-1 block text-xs font-medium text-navy-500">
          Must match a grant agreement or workplan. Published as written.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wide text-navy-600">
            Reporting line
          </span>
          <input
            name="reportingLine"
            type="text"
            defaultValue={project.reporting_line}
            placeholder="e.g. Kisumu County Health Department"
            className={cn(input, "mt-1.5")}
          />
        </label>

        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wide text-navy-600">
            People reached
          </span>
          <input
            name="beneficiaries"
            type="number"
            min={0}
            defaultValue={project.beneficiaries || ""}
            placeholder="Not set"
            className={cn(input, "mt-1.5 tabular-nums")}
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wide text-navy-600">
          Cover image
        </span>
        <input
          name="coverImage"
          type="text"
          defaultValue={project.cover_image ?? ""}
          placeholder="/projects/my-project.jpg or a Supabase Storage URL"
          className={cn(input, "mt-1.5 font-mono text-xs")}
        />
        <span className="mt-1 block text-xs font-medium text-navy-500">
          Written consent must be on file before publishing any identifiable person.
        </span>
      </label>

      <div className="flex items-center justify-between gap-4 border-t border-navy-100 pt-4">
        <p className="text-xs font-medium text-navy-500">
          Blank fields are omitted from the public site — never filled with a placeholder.
        </p>
        <SubmitButton dirty={dirty} />
      </div>
    </form>
  );
}
