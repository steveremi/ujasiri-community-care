"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Lock, ShieldCheck } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { createSessionAction, provisionProfileAction } from "@/app/actions/auth";
import { authErrorMessage, firebaseAuth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Sign in / register.
 *
 * The sequence is the same for both, and it all happens in this one component
 * because the steps are inseparable:
 *
 *   1. Firebase authenticates in the browser and returns an ID token.
 *   2. (Register only) a Server Action creates the profile row, which is where
 *      the super-admin bootstrap is decided — in the database, atomically.
 *   3. A Server Action exchanges the ID token for an httpOnly session cookie.
 *   4. We navigate; the server now knows who this is.
 *
 * The password never reaches our server, and the session cookie is never
 * readable by client JavaScript.
 */

const inputClass =
  "w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-[0.9375rem] " +
  "text-navy-950 placeholder:text-navy-400 focus:border-azure-500 focus:outline-none " +
  "focus:ring-2 focus:ring-azure-500/20";

export function AuthForm({
  mode,
  isFirstAccount,
}: {
  mode: "login" | "register";
  /** True when no super admin exists yet, so this registration claims it. */
  isFirstAccount?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const auth = firebaseAuth();
    if (!auth) {
      setError("Sign-in is temporarily unavailable. Please try again shortly.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    if (mode === "register" && password.length < 8) {
      setError("Choose a password of at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const credential =
        mode === "register"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);

      if (mode === "register") {
        await updateProfile(credential.user, { displayName: name });

        const provision = new FormData();
        provision.set("uid", credential.user.uid);
        provision.set("email", email);
        provision.set("name", name);

        const result = await provisionProfileAction({ ok: false, message: "" }, provision);
        if (!result.ok) {
          setError(result.message);
          setBusy(false);
          return;
        }
        // The custom role claim was just set; force a token refresh so the
        // session cookie we mint below carries it.
        await credential.user.getIdToken(true);
      }

      const idToken = await credential.user.getIdToken();
      const session = new FormData();
      session.set("idToken", idToken);

      const result = await createSessionAction({ ok: false, message: "" }, session);
      if (!result.ok) {
        setError(result.message);
        setBusy(false);
        return;
      }

      startTransition(() => {
        router.replace("/admin");
        router.refresh();
      });
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  const working = busy || pending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {mode === "register" && isFirstAccount && (
        <div className="flex gap-3 rounded-xl border border-azure-200 bg-azure-50 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-azure-700" aria-hidden="true" />
          <div className="text-[0.8125rem] leading-relaxed text-navy-800">
            <p className="font-semibold">This will be the Super Admin account.</p>
            <p className="mt-1">
              No administrator exists yet, so this first registration takes full control of the
              organisation. Every account created afterwards starts as a Member with no admin
              access, and only you can change that.
            </p>
          </div>
        </div>
      )}

      {mode === "register" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-navy-800">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Grace Wanjiku"
            className={cn(inputClass, "mt-1.5")}
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy-800">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@ujasiricommunitycare.or.ke"
          className={cn(inputClass, "mt-1.5")}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-navy-800">
            Password
          </label>
          {mode === "login" && (
            <Link
              href="/forgot-password"
              className="text-[0.8125rem] font-medium text-azure-700 underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          placeholder="••••••••"
          className={cn(inputClass, "mt-1.5")}
        />
        {mode === "register" && (
          <p className="mt-1.5 text-xs text-navy-500">
            At least 8 characters. Use a passphrase you do not use anywhere else — this account
            can reach client records.
          </p>
        )}
      </div>

      {error && (
        <p
          className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={working} className="w-full">
        {working ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {mode === "register" ? "Creating account…" : "Signing in…"}
          </>
        ) : (
          <>
            <Lock className="size-4" aria-hidden="true" />
            {mode === "register" ? "Create account" : "Sign in"}
          </>
        )}
      </Button>
    </form>
  );
}
