import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
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
