"use client";

import { useState } from "react";
import { AlertCircle, Loader2, MailCheck, Send } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { authErrorMessage, firebaseAuth } from "@/lib/firebase/client";

/**
 * Password reset request.
 *
 * Always reports success, whatever actually happened. Telling a visitor "no
 * account exists with that email" turns this form into a way to test whether
 * a given person has an account with an HIV and GBV organisation — which is
 * exactly the kind of disclosure this system exists to prevent.
 */
export function ResetForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const auth = firebaseAuth();

    if (!auth) {
      // No account enumeration, and no leaking of deployment state either.
      setSent(true);
      setBusy(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const code =
        typeof err === "object" && err && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      // Only surface problems with the request itself, never with the account.
      if (code === "auth/invalid-email" || code === "auth/too-many-requests") {
        setError(authErrorMessage(err));
        setBusy(false);
        return;
      }
    }

    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="rounded-card border-2 border-azure-200 bg-azure-50/60 p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-azure-600 text-white">
          <MailCheck className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold text-navy-950">Check your email</h2>
        <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
          If an account exists for that address, we&apos;ve sent a link to reset the password. It
          expires in one hour.
        </p>
        <p className="mt-3 text-[0.8125rem] font-medium text-navy-500">
          Nothing arrived? Check your spam folder, then try again.
        </p>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="mt-5"
          onClick={() => setSent(false)}
        >
          Try a different address
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-navy-800">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@ujasiricommunitycare.or.ke"
          className="mt-1.5 w-full rounded-xl border-2 border-navy-200 bg-white px-3.5 py-2.5 text-[0.9375rem] font-medium text-navy-950 placeholder:text-navy-400 focus:border-azure-500 focus:outline-none focus:ring-2 focus:ring-azure-500/20"
        />
      </div>

      {error && (
        <p
          className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={busy} className="w-full">
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            Send reset link
          </>
        )}
      </Button>
    </form>
  );
}
