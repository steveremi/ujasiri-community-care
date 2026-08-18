import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Web app manifest. Worth having: a supporter or field worker who adds this to
 * a home screen gets an icon and an offline-tolerant shell, on exactly the
 * kind of low-end Android device most of our users carry.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#001f5b",
    lang: "en-KE",
    categories: ["health", "medical", "social"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "Get help", url: "/get-help", description: "Find services near you" },
      { name: "Donate", url: "/donate", description: "Support our work" },
    ],
  };
}
