import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables forbidden() and unauthorized(), which let the Data Access Layer
    // distinguish "not signed in" from "signed in, but not yours" and render
    // the matching boundary. See src/app/{unauthorized,forbidden}.tsx.
    authInterrupts: true,
  },

  images: {
    // Modern formats first; Next falls back automatically for older browsers.
    // On the connections most of our visitors use, this is the single biggest
    // performance lever the site has.
    formats: ["image/avif", "image/webp"],
    // Required from Next.js 16: an explicit allowlist of quality values.
    // Without it every /_next/image request 400s, which is what was breaking
    // the hero photographs. 72 is what the hero requests; 75 is the framework
    // default used everywhere else.
    qualities: [72, 75],
    remotePatterns: [
      // Supabase Storage — the bucket photographs will be uploaded to.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    // Long cache: uploaded photographs are immutable once published.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Never ship a build that only type-checks by ignoring its own errors.
  // (Next.js 16 dropped the `eslint` config key; linting runs via `npm run lint`.)
  typescript: { ignoreBuildErrors: false },

  // Trims the "X-Powered-By: Next.js" fingerprint.
  poweredByHeader: false,

  // Trailing-slash-free canonical URLs, matching what sitemap.ts emits.
  trailingSlash: false,

  async redirects() {
    return [
      // Common mistypes and the paths people guess at for a health NGO.
      { source: "/help", destination: "/get-help", permanent: true },
      { source: "/give", destination: "/donate", permanent: true },
      { source: "/support-us", destination: "/donate", permanent: true },
      { source: "/blog", destination: "/news", permanent: true },
      { source: "/blog/:slug", destination: "/news/:slug", permanent: true },
      { source: "/volunteer", destination: "/get-involved/volunteer", permanent: true },
      { source: "/annual-report", destination: "/reports", permanent: true },
    ];
  },
};

export default nextConfig;
