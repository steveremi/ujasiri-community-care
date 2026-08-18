/**
 * Shared form-state shapes for useActionState.
 *
 * These live outside the `"use server"` action files on purpose: such a file
 * may only export async functions, so an exported constant like
 * `emptyFormState` breaks the whole module at runtime. Types are erased at
 * compile time and would be fine either way — the constants are not.
 */

export interface FormState {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
}

export const emptyFormState: FormState = { ok: false, message: "" };

export interface AuthState extends FormState {
  /** SUPER_ADMIN when a registration claimed the bootstrap. */
  role?: string;
}

export const emptyAuthState: AuthState = { ok: false, message: "" };

export interface DonateState extends FormState {
  /** Where to send the donor next, once a provider is wired up. */
  redirectUrl?: string;
  reference?: string;
}

export const emptyDonateState: DonateState = { ok: false, message: "" };
