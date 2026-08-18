import "server-only";

import { cache } from "react";

import { readClient } from "@/lib/supabase/server";
import { site as defaults } from "@/lib/site";

/**
 * Organisation settings.
 *
 * Everything a staff member should be able to change without a developer —
 * the organisation's name, contact details, registration numbers, hotlines and
 * social profiles — is stored in the `settings` table and edited from
 * /admin/settings.
 *
 * `src/lib/site.ts` remains, but only as the fallback used before the database
 * is connected and as the shape the stored record must satisfy. Once a value
 * exists in the database it wins.
 *
 * Wrapped in React's `cache` so a request that renders a header, a footer and
 * a JSON-LD block performs one read rather than three.
 */

export type OrgSettings = typeof defaults;

/** Values a person can edit. Navigation and structure stay in code. */
export interface EditableSettings {
  name: string;
  shortName: string;
  legalName: string;
  tagline: string;
  mission: string;
  description: string;
  founded: string;
  registration: {
    label: string;
    number: string;
    authority: string;
    taxLabel: string;
    taxNumber: string;
  };
  contact: {
    email: string;
    supportEmail: string;
    safeguardingEmail: string;
    phone: string;
    address: {
      street: string;
      locality: string;
      region: string;
      postalCode: string;
      country: string;
      countryName: string;
    };
    hours: string;
  };
  help: {
    urgentNote: string;
    lines: { label: string; number: string; note: string }[];
  };
  customerCare: { lines: string[]; hours: string };
  social: Record<string, string>;
  twitterHandle: string;
}

const SETTINGS_KEY = "organisation";

/**
 * Merge a stored record over the compiled defaults.
 *
 * Deep rather than shallow: a record that only sets `contact.phone` must not
 * wipe the address alongside it, which is exactly what a spread would do.
 */
function merge<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;
  if (typeof base !== "object" || base === null) return patch as T;
  if (Array.isArray(base)) return (Array.isArray(patch) ? patch : base) as T;
  if (typeof patch !== "object" || Array.isArray(patch)) return base;

  const out = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    if (key in out) out[key] = merge(out[key], value);
  }
  return out as T;
}

/**
 * The organisation's settings, from the database where available.
 *
 * Never throws. A settings read that fails must not take the site down — it
 * falls back to the compiled defaults, which are always a complete record.
 */
export const getSettings = cache(async (): Promise<OrgSettings> => {
  const db = readClient();
  if (!db) return defaults;

  try {
    const { data, error } = await db
      .from("settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) return defaults;
    return merge(defaults, data.value);
  } catch {
    return defaults;
  }
});

export { SETTINGS_KEY };
