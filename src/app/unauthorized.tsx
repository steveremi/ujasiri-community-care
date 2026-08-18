import Link from "next/link";
import { LogIn } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

/**
 * 401 boundary. Rendered when the DAL calls `unauthorized()` — the visitor is
 * not signed in. Distinct from forbidden.tsx on purpose: "sign in" and "this
 * isn't yours" are different problems and deserve different instructions.
 */
export default function Unauthorized() {
  return (
    <div className="grid min-h-svh place-items-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Logo className="justify-center" />
        <span className="mx-auto mt-10 grid size-14 place-items-center rounded-full bg-navy-50 text-navy-700">
          <LogIn className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-navy-950">
          Please sign in
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-navy-600">
          This page is part of the staff area. Sign in with your Ujasiri account to continue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/login">Sign in</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to the website
          </ButtonLink>
        </div>
        <p className="mt-8 text-sm text-navy-500">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-azure-700 underline underline-offset-4">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
