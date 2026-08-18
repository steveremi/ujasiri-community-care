"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Power, PowerOff } from "lucide-react";

import { assignRoleAction, setUserActiveAction } from "@/app/actions/admin";
import { emptyFormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

/**
 * Role assignment.
 *
 * The list of roles offered here is already filtered by rank on the server
 * before it reaches the browser, and the server re-checks on submit. Both
 * matter: filtering alone would be trivially bypassed by editing the DOM.
 */
export function RoleSelect({
  userId,
  roleId,
  roles,
  locked,
  lockReason,
}: {
  userId: string;
  roleId: number;
  roles: { id: number; label: string }[];
  locked?: boolean;
  lockReason?: string;
}) {
  const [state, formAction] = useActionState(assignRoleAction, emptyFormState);
  const formRef = useRef<HTMLFormElement>(null);

  if (locked) {
    return (
      <span className="text-xs font-semibold text-navy-400" title={lockReason}>
        {roles.find((r) => r.id === roleId)?.label ?? "—"}
      </span>
    );
  }

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <RoleControl roleId={roleId} roles={roles} formRef={formRef} />
      {state.message && !state.ok && (
        <p className="mt-1 max-w-[16rem] text-xs font-semibold text-red-600" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}

function RoleControl({
  roleId,
  roles,
  formRef,
}: {
  roleId: number;
  roles: { id: number; label: string }[];
  formRef: React.RefObject<HTMLFormElement | null>;
}) {
  const { pending } = useFormStatus();
  return (
    <select
      name="roleId"
      defaultValue={roleId}
      disabled={pending}
      onChange={() => formRef.current?.requestSubmit()}
      aria-label="Change role"
      className={cn(
        "rounded-full border-2 border-navy-200 bg-white px-2.5 py-1 text-xs font-bold",
        "text-navy-800 focus:border-azure-500 focus:outline-none focus:ring-2",
        "focus:ring-azure-500/20 disabled:opacity-50",
      )}
    >
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Activate / deactivate.
 *
 * Deactivating also disables the Firebase account, so existing sessions stop
 * working on the next request rather than surviving until the cookie expires.
 */
export function ActiveToggle({
  userId,
  active,
  locked,
  lockReason,
}: {
  userId: string;
  active: boolean;
  locked?: boolean;
  lockReason?: string;
}) {
  const [state, formAction] = useActionState(setUserActiveAction, emptyFormState);

  if (locked) {
    return (
      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
          active
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : "bg-navy-50 text-navy-500 ring-navy-200",
        )}
        title={lockReason}
      >
        {active ? "Active" : "Deactivated"}
      </span>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="active" value={active ? "false" : "true"} />
      <ToggleButton active={active} />
      {state.message && !state.ok && (
        <p className="mt-1 max-w-[16rem] text-xs font-semibold text-red-600" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}

function ToggleButton({ active }: { active: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        "ring-1 ring-inset transition-colors disabled:opacity-50",
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-red-50 hover:text-red-700 hover:ring-red-200"
          : "bg-navy-50 text-navy-500 ring-navy-200 hover:bg-emerald-50 hover:text-emerald-700",
      )}
      title={active ? "Deactivate this account" : "Reactivate this account"}
    >
      {active ? (
        <Power className="size-3" aria-hidden="true" />
      ) : (
        <PowerOff className="size-3" aria-hidden="true" />
      )}
      {active ? "Active" : "Deactivated"}
    </button>
  );
}
