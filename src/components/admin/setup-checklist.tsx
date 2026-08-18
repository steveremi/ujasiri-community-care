import Link from "next/link";
import { Check, Circle, ExternalLink } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { ButtonLink } from "@/components/ui/button";
import { setupStatus } from "@/lib/env";
import { cn } from "@/lib/utils";

/**
 * Shown at /admin before the services are connected.
 *
 * The alternative — redirecting to a login page that cannot possibly succeed —
 * is the kind of dead end that makes someone assume the build is broken. This
 * says exactly what is missing and where to get it.
 */
export function SetupChecklist({ signInPrompt = false }: { signInPrompt?: boolean }) {
  const status = setupStatus();
  const done = status.filter((s) => s.ready).length;

  const steps = [
    {
      title: "Create a Supabase project",
      body: "Then copy the project URL, the anon key and the service role key from Project Settings → API into .env.local.",
      href: "https://supabase.com/dashboard",
      linkLabel: "Supabase dashboard",
    },
    {
      title: "Run the migrations",
      body: "Paste supabase/migrations/0001_init.sql and 0002_seed_roles.sql into the Supabase SQL editor, in that order. This creates every table, the row-level security policies, and the seven built-in roles.",
    },
    {
      title: "Create a Firebase project and a web app",
      body: "Copy the web app config into the NEXT_PUBLIC_FIREBASE_* variables, then generate a service account key and copy those three values into the FIREBASE_* variables.",
      href: "https://console.firebase.google.com",
      linkLabel: "Firebase console",
    },
    {
      title: "Enable Email/Password sign-in",
      body: "In the Firebase console under Authentication → Sign-in method.",
    },
    {
      title: "Connect Supabase to Firebase",
      body: "In Supabase: Authentication → Sign In / Providers → Third Party Auth → add Firebase with your Firebase project ID. This is what makes the row-level security policies trust Firebase tokens.",
    },
    {
      title: "Register the first account",
      body: "The first person to register automatically becomes Super Admin. Every account after that starts as a Member with no admin access.",
    },
  ];

  return (
    <div className="min-h-svh bg-navy-50/40 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Logo />

        <h1 className="mt-10 text-3xl font-extrabold tracking-tight text-navy-950">
          {signInPrompt ? "Almost there" : "Finish setting up the admin"}
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-navy-600">
          {signInPrompt
            ? "Your services are connected. Sign in — or register the first account, which becomes the Super Admin."
            : "The public website is running on sample content. Connect Supabase and Firebase to turn on the database, logins and this admin area."}
        </p>

        {/* Connection status */}
        <div className="mt-8 rounded-card border border-navy-100 bg-white p-6 shadow-card">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-navy-950">Connection status</h2>
            <span className="text-sm text-navy-500">{done} of {status.length} connected</span>
          </div>
          <ul className="mt-5 space-y-3.5">
            {status.map((item) => (
              <li key={item.key} className="flex gap-3">
                <span
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                    item.ready ? "bg-azure-600 text-white" : "bg-navy-100 text-navy-400",
                  )}
                >
                  {item.ready ? (
                    <Check className="size-3" aria-hidden="true" />
                  ) : (
                    <Circle className="size-2 fill-current" aria-hidden="true" />
                  )}
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-semibold text-navy-900">
                    {item.label}
                  </span>
                  <span className="block text-[0.8125rem] leading-relaxed text-navy-600">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {signInPrompt ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/login">Sign in</ButtonLink>
            <ButtonLink href="/register" variant="outline">
              Register the first account
            </ButtonLink>
          </div>
        ) : (
          <ol className="mt-10 space-y-6">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-900 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <h3 className="font-semibold text-navy-950">{step.title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-navy-600">
                    {step.body}
                  </p>
                  {step.href && (
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-azure-700 underline-offset-4 hover:underline"
                    >
                      {step.linkLabel}
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        <p className="mt-10 border-t border-navy-100 pt-6 text-sm text-navy-500">
          Everything you need is in{" "}
          <code className="rounded bg-navy-900/5 px-1.5 py-0.5 font-mono text-xs">.env.example</code>.{" "}
          <Link href="/" className="font-medium text-azure-700 underline underline-offset-4">
            Back to the website
          </Link>
        </p>
      </div>
    </div>
  );
}
