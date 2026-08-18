import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { redirectIfSignedIn } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Ujasiri Community Care staff area.",
  // A sign-in page has no business in a search index.
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  await redirectIfSignedIn("/admin");

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-950">
        Sign in
      </h1>
      <p className="mt-2 text-[0.9375rem] text-navy-600">
        For UCC staff, volunteers and supporters with an account.
      </p>

      <div className="mt-8">
        <AuthForm mode="login" />
      </div>

      <p className="mt-8 text-sm text-navy-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-azure-700 underline-offset-4 hover:underline"
        >
          Register
        </Link>
      </p>

      <p className="mt-6 border-t border-navy-100 pt-6 text-xs leading-relaxed text-navy-500">
        This system holds information about people we serve. Never share your password, never
        sign in on a device you do not control, and always sign out when you finish.
      </p>
    </div>
  );
}
