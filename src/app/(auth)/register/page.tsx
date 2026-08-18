import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { bootstrapClaimed } from "@/app/actions/auth";
import { redirectIfSignedIn } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Ujasiri Community Care account.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  await redirectIfSignedIn("/admin");

  // null means we cannot tell yet (no database). Treat that as "not claimed"
  // for the copy, but the database is what actually decides at registration.
  const claimed = await bootstrapClaimed();
  const isFirstAccount = claimed === false;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-950">
        {isFirstAccount ? "Set up your organisation" : "Create an account"}
      </h1>
      <p className="mt-2 text-[0.9375rem] text-navy-600">
        {isFirstAccount
          ? "You are the first person here. This account will hold full administrative control."
          : "Registering gives you a supporter account: your giving history and any volunteer applications, in one place."}
      </p>

      <div className="mt-8">
        <AuthForm mode="register" isFirstAccount={isFirstAccount} />
      </div>

      <p className="mt-8 text-sm text-navy-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-azure-700 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-6 border-t border-navy-100 pt-6 text-xs leading-relaxed text-navy-500">
        By registering you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
}
