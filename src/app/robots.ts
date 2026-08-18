import type { MetadataRoute } from "next";

import { isDemoMode } from "@/lib/env";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Without Supabase the site renders fixture content — invented people,
  // placeholder impact figures. That is fine for a demo and deliberate (see
  // src/lib/env.ts), but it must never be crawled: a search result pairing UCC
  // with a fabricated client story is a safeguarding problem, and one search
  // engines are slow to forget. Graceful degradation stops at rendering.
  if (isDemoMode) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Nothing behind authentication, and nothing that would let a
          // crawler surface an account page, belongs in an index.
          "/admin",
          "/admin/",
          "/login",
          "/register",
          "/forgot-password",
          "/api/",
          // Filtered listing permutations dilute the canonical pages.
          "/*?*page=",
          "/*?*status=",
          "/*?*program=",
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
