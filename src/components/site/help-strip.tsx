import Link from "next/link";
import { ArrowRight, Clock, Phone, ShieldCheck } from "lucide-react";

import { AfterHoursLines } from "@/components/site/after-hours-lines";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Crisis routes, placed directly beneath the hero.
 *
 * The 72-hour message sits here rather than buried in a programme page because
 * it is time-critical: post-exposure prophylaxis only works if it starts soon,
 * and somebody who needs that fact needs it before they have read anything
 * else.
 *
 * The numbers are rendered as large, thumb-sized tap targets. Most visitors
 * reach this on a phone, and a person in distress should not have to aim.
 */
export function HelpStrip() {
  return (
    <section
      className="relative border-b border-azure-200/70 bg-gradient-to-b from-azure-50 to-white"
      aria-labelledby="help-now"
    >
      <div className="container-page py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <div>
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-navy-900 text-azure-300">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="help-now"
                  className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-[1.75rem]"
                >
                  Need help right now?
                </h2>
                <p className="mt-1 text-sm font-bold text-azure-700">
                  Free · Confidential · No appointment needed
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-[0.9375rem] font-medium leading-relaxed text-navy-700">
              {site.help.urgentNote}
            </p>

            <Link
              href="/get-help"
              className="group mt-5 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-azure-700 underline-offset-4 hover:underline"
            >
              All support services
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {site.help.lines.map((line, i) => (
                <li key={line.number}>
                  <a
                    href={`tel:${line.number.replace(/\s/g, "")}`}
                    className={cn(
                      "group flex h-full items-center gap-4 rounded-card px-5 py-4 transition-all",
                      i === 0
                        ? "bg-navy-900 text-white shadow-card hover:bg-navy-800 hover:shadow-lift"
                        : "border-2 border-azure-200 bg-white hover:border-azure-500 hover:shadow-card",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-full transition-transform group-hover:scale-105",
                        i === 0 ? "bg-azure-500 text-navy-950" : "bg-navy-900 text-white",
                      )}
                    >
                      <Phone className="size-5" aria-hidden="true" />
                    </span>

                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-[0.6875rem] font-bold uppercase tracking-[0.1em]",
                          i === 0 ? "text-azure-300" : "text-navy-500",
                        )}
                      >
                        {line.label}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-xl font-extrabold leading-tight tracking-tight",
                          i === 0 ? "text-white" : "text-navy-950",
                        )}
                      >
                        {line.number}
                      </span>
                      <span
                        className={cn(
                          "mt-1 flex items-center gap-1.5 text-xs font-medium",
                          i === 0 ? "text-white/60" : "text-navy-500",
                        )}
                      >
                        <Clock className="size-3 shrink-0" aria-hidden="true" />
                        {line.note}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* National 24-hour services, surfaced when our office is closed. */}
            <AfterHoursLines className="mt-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
