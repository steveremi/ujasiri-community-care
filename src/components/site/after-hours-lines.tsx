"use client";

import { useEffect, useState } from "react";
import { Clock, Phone } from "lucide-react";

import { isOfficeOpen, nationalLines } from "@/lib/office-hours";
import { cn } from "@/lib/utils";

/**
 * National 24-hour helplines, shown when the UCC office is closed.
 *
 * The default state is VISIBLE, and it is only hidden once the client has
 * confirmed the office is currently staffed. That ordering matters:
 *
 *  - Server-rendered HTML always contains the numbers, so they are present
 *    even if JavaScript never runs or fails.
 *  - Pages here are statically cached for an hour, so the server cannot know
 *    the current time anyway — deciding on the client is the only way to get
 *    this right without making every page dynamic.
 *  - A brief flash of extra emergency numbers during office hours is a
 *    non-event. Their absence at 2am is not.
 */
export function AfterHoursLines({
  variant = "card",
  className,
}: {
  variant?: "card" | "inline";
  className?: string;
}) {
  // Starts true so the markup ships with the numbers in it.
  const [show, setShow] = useState(true);

  useEffect(() => {
    const update = () => setShow(!isOfficeOpen());
    update();
    // Re-check every five minutes so a page left open across closing time
    // updates itself rather than going stale.
    const id = setInterval(update, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!show) return null;

  if (variant === "inline") {
    return (
      <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
        <span className="font-medium text-navy-300">Our office is closed —</span>
        {nationalLines.map((line) => (
          <a
            key={line.number}
            href={`tel:${line.number}`}
            className="font-bold text-azure-300 underline-offset-4 hover:underline"
          >
            {line.label} {line.number}
          </a>
        ))}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-card border-2 border-azure-300 bg-azure-100/70 p-6",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-950">
        <Clock className="size-5 text-azure-800" aria-hidden="true" />
        Our office is closed right now
      </h2>
      <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-navy-700">
        These national services answer 24 hours a day. They are free to call, and they are not
        operated by us — which is exactly why we list them: right now they will be answered and
        we will not.
      </p>

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {nationalLines.map((line) => (
          <li key={line.number}>
            <a
              href={`tel:${line.number}`}
              className="flex h-full items-center gap-3 rounded-xl border-2 border-azure-200 bg-white px-4 py-3 transition-colors hover:border-azure-500"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-900 text-white">
                <Phone className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide text-navy-500">
                  {line.label}
                </span>
                <span className="block text-lg font-extrabold leading-tight text-navy-950">
                  {line.number}
                </span>
                <span className="block text-[0.6875rem] font-medium text-navy-500">
                  {line.note}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
