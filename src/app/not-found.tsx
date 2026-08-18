import Link from "next/link";
import { Compass } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <Logo className="justify-center" />

        <span className="mx-auto mt-10 grid size-14 place-items-center rounded-full bg-azure-50 text-azure-700">
          <Compass className="size-6" aria-hidden="true" />
        </span>

        <p className="mt-6 font-mono text-sm font-bold text-azure-600">404</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950">
          We can&apos;t find that page
        </h1>
        <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-navy-600">
          It may have moved, or the link may be wrong. Here is where most people are heading.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/get-help">Find help near you</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to the homepage
          </ButtonLink>
        </div>

        {/* Somebody who mistypes a URL on a health site may still need help
            urgently — never let a 404 be a dead end. */}
        <div className="mt-10 rounded-card border-2 border-azure-200 bg-azure-50/60 p-5 text-left">
          <p className="text-sm font-bold text-navy-950">Need help right now?</p>
          <ul className="mt-3 space-y-1.5">
            {site.help.lines.map((line) => (
              <li key={line.label} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-navy-600">{line.label}</span>
                <a
                  href={`tel:${line.number.replace(/\s/g, "")}`}
                  className="shrink-0 font-mono font-bold text-azure-700 hover:underline"
                >
                  {line.number}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-sm font-medium text-navy-500">
          Still stuck?{" "}
          <Link href="/contact" className="font-bold text-azure-700 underline underline-offset-4">
            Tell us what you were looking for
          </Link>
        </p>
      </div>
    </div>
  );
}
