import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/site/logo";
import { ImageRotator } from "@/components/media/image-rotator";
import { deal } from "@/lib/gallery";
import { site } from "@/lib/site";

/**
 * Split layout for sign-in and registration.
 *
 * The left panel restates who we are and what the account is for. Staff sign
 * in from field locations on shared devices; a page that could be any login
 * form is a page that trains people not to check what they are typing into.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-svh overflow-hidden lg:grid-cols-2">
      <div className="flex flex-col overflow-y-auto px-6 py-8 sm:px-12 lg:px-16">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <footer className="text-xs text-navy-500">
          <p>
            © {new Date().getFullYear()} {site.legalName} ·{" "}
            <Link href="/" className="underline-offset-4 hover:underline">
              Back to the website
            </Link>
          </p>
          <p className="mt-1.5">
            Built by{" "}
            <a
              href={site.poweredBy.url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium underline-offset-4 hover:underline"
            >
              {site.poweredBy.name}
            </a>
          </p>
        </footer>
      </div>

      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <ImageRotator
          images={deal(4, 0, 8)}
          alt=""
          offset={2}
          overlay
          position="absolute"
          className="inset-0 h-full"
          sizes="50vw"
        />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <blockquote className="max-w-md">
            <p className="text-2xl font-bold leading-snug text-white">
              &ldquo;{site.mission}&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
