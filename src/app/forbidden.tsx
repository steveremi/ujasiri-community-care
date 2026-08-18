import { ShieldOff } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { site } from "@/lib/site";

/**
 * 403 boundary. The visitor is signed in but their role does not carry the
 * permission this page requires.
 *
 * Wording matters here: this is not an error the person made, and on a system
 * holding client health information a locked door is the system working. The
 * copy says so, and points at the one action that can actually help.
 */
export default function Forbidden() {
  return (
    <div className="grid min-h-svh place-items-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Logo className="justify-center" />
        <span className="mx-auto mt-10 grid size-14 place-items-center rounded-full bg-navy-50 text-navy-700">
          <ShieldOff className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-navy-950">
          You don&apos;t have access to this
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-navy-600">
          Your account is signed in, but your role doesn&apos;t include this area. That is
          intentional — access here is granted only where it is needed for the work.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/admin">Back to dashboard</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to the website
          </ButtonLink>
        </div>
        <p className="mt-8 text-sm text-navy-500">
          If you need this access, ask an administrator — or email{" "}
          <a
            href={`mailto:${site.contact.email}`}
            className="font-medium text-azure-700 underline underline-offset-4"
          >
            {site.contact.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
