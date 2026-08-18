import type { Metadata } from "next";
import Link from "next/link";

import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Reset the password for your Ujasiri Community Care account.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-950">
        Reset your password
      </h1>
      <p className="mt-2 text-[0.9375rem] font-medium text-navy-600">
        Enter the email address on your account and we&apos;ll send you a link to set a new
        password.
      </p>

      <div className="mt-8">
        <ResetForm />
      </div>

      <p className="mt-8 text-sm font-medium text-navy-600">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-bold text-azure-700 underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
