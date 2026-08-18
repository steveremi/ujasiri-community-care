import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (called Middleware before Next.js 16).
 *
 * Two jobs, and deliberately only two:
 *
 *  1. Security headers on every response.
 *  2. An *optimistic* redirect away from /admin when no session cookie is
 *     present at all.
 *
 * What this file explicitly does NOT do is authorise anything. It only checks
 * whether a cookie exists — not whether it is valid, not what role it carries.
 * Verifying a Firebase session cookie means a network call, and doing that on
 * every request through the edge is both slow and the wrong place for it. The
 * real check happens in the Data Access Layer (src/lib/auth/dal.ts), which
 * every admin page and Server Action goes through.
 *
 * Treating proxy as a UX shortcut rather than a security boundary is the
 * pattern Next.js documents, and it is what keeps a forged cookie from being
 * enough to see anything.
 */

const SESSION_COOKIE = "ucc_session";

const securityHeaders: Record<string, string> = {
  // Stops the site being framed into a phishing page that impersonates us.
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // No page here needs a camera, microphone or location.
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "X-DNS-Prefetch-Control": "on",
};

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  let response: NextResponse;

  if (pathname.startsWith("/admin") && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Send them back where they were headed once they have signed in.
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    response = NextResponse.redirect(url);
  } else if ((pathname === "/login" || pathname === "/register") && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // HSTS only in production — setting it against localhost pins http://localhost
  // to https in the browser and is genuinely painful to undo.
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  // Admin pages must never be cached by a proxy or CDN.
  if (pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets, image optimisation and metadata files.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
