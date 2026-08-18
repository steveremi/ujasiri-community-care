---
name: run-ujasiri
description: Build, run, and drive the Ujasiri Community Care site (Next.js). Use when asked to start the site, launch the dev server, build it, typecheck or lint it, take a screenshot of a page, submit one of its forms, or otherwise interact with the running app.
---

The Ujasiri Community Care website — Next.js 16 (App Router, Turbopack) with
Supabase for data and Firebase for auth, both optional. Drive it with
`.claude/skills/run-ujasiri/driver.mjs`, which talks to `google-chrome` over the
DevTools Protocol.

All paths below are relative to `my-app/`.

## Prerequisites

Nothing to install. Verified present in this container:

```bash
node -v            # v24.19.0 — the driver needs Node 22+ for global WebSocket
npm -v             # 11.17.0
which google-chrome # /usr/bin/google-chrome
```

There is **no** `chromium-cli`, Playwright, Puppeteer, `tmux` or `xvfb-run`
here, and you cannot install a browser (see Gotchas). The driver needs none of
them.

## Setup

```bash
npm ci    # ~16s
```

**No `.env.local` is needed.** With no keys the site runs in demo mode against
the fixtures in `src/lib/fixtures/` — every page renders and every route works.
Writes are refused with a visible message, which is correct behaviour, not a
bug. `.env.example` documents the keys for going live; `src/lib/env.ts` explains
the three supported states.

## Build & verify

```bash
npm run verify    # typecheck + lint, both clean as of this writing
npm run build     # full production build, prerenders ~40 static + SSG pages
```

## Run: agent path

The driver starts the dev server itself if one isn't already up, and reuses a
running one if there is (Next compiles routes on first request, so reusing the
warm server is much faster).

```bash
# every route: HTTP status, rendered size, <h1>, console errors + screenshots
node .claude/skills/run-ujasiri/driver.mjs smoke

# one page, full-height PNG into .screenshots/
node .claude/skills/run-ujasiri/driver.mjs shot /partners

# rendered text of a page
node .claude/skills/run-ujasiri/driver.mjs text /donate

# run JS in the page and print the result as JSON
node .claude/skills/run-ujasiri/driver.mjs eval /partners \
  "Array.from(document.querySelectorAll('h3')).map(e => e.innerText)"

# click something, then report the resulting URL + a screenshot
node .claude/skills/run-ujasiri/driver.mjs click / "a[href='/donate']"

# fill a form by field name and submit it through its Server Action
node .claude/skills/run-ujasiri/driver.mjs submit /contact "form:has([name=message])" \
  '{"name":"Test","email":"t@example.com","subject":"Hi","message":"Body text here."}'
```

Screenshots land in `.screenshots/` (gitignored). **Open them with Read.** They
are full-page, so the homepage is ~4MB.

Env overrides: `BASE_URL` (default `http://127.0.0.1:3000`), `SHOT_DIR`,
`CDP_PORT` (default 9222).

To drive a production build instead of dev:

```bash
npm run build
PORT=3001 npx next start &
sleep 8
BASE_URL=http://127.0.0.1:3001 SHOT_DIR=.screenshots/prod \
  node .claude/skills/run-ujasiri/driver.mjs smoke
fuser -k 3001/tcp    # see the process-name gotcha below — pkill will NOT work
```

## Run: human path

```bash
npm run dev    # http://localhost:3000, ready in ~2s
```

Useless on its own in a headless container — there's no browser window to look
at. Use the driver.

## Gotchas

- **`curl` cannot reach the public internet** from this container; the sandbox
  proxy hangs it. `npm` *is* allowlisted, so `npm ci` works fine. `curl` against
  `localhost` also works fine. To read a web page, use WebFetch, not `curl`.
- **You cannot install Playwright or Puppeteer.** `npm i` fetches their browser
  binaries from a non-registry host that the proxy blocks. This is exactly why
  `driver.mjs` speaks raw CDP over Node's built-in `WebSocket` — it has zero
  dependencies and needs no download.
- **Chrome needs `--no-sandbox`** here (no user namespaces); without it the
  zygote dies at startup. Already in the driver.
- **`/admin` returns 200 and renders "Sign in"**, not a 403. Firebase isn't
  configured, so the auth gate sends you to the login page. That is the route
  working, not failing.
- **`/gallery` 404s by design.** There's a `src/lib/gallery.ts` and 46 images in
  `public/gallery/`, but no route — the lib feeds the homepage rotator. Don't
  "fix" it without asking.
- **Setting `input.value` does nothing to a React form.** React 19 tracks the
  last value it wrote and swallows the event, so the field reverts on submit.
  You have to call the prototype's `value` setter, then dispatch `input`.
  `driver.mjs submit` already does this — copy it rather than rewriting it.
- **`pkill -f "next start"` silently does nothing.** Next renames its process to
  `next-server (v16.3.0)`, so the pattern never matches and you are left with a
  server still holding the port — the next `next start` then dies with
  `EADDRINUSE`, and if you don't read the log you'll think you tested a fresh
  build when you actually re-tested the stale one. Kill by port instead:
  `fuser -k 3001/tcp`. That also avoids taking down the dev server on 3000,
  which a `pkill -f next-server` would.
- **Don't poll a cold route with a short `curl --max-time`.** Next compiles on
  first request, so every short-timeout attempt aborts mid-compile and the loop
  looks like a dead server. Use one request with a long timeout, or just let the
  driver handle it (it waits up to 45s).
- **`next dev` rewrites `next-env.d.ts`** on every run, and re-adds its block to
  `AGENTS.md`. Both are expected diffs; `next-env.d.ts` is gitignored.
- **`npm ci` skips 4 postinstall scripts** (`esbuild`, `protobufjs`,
  `@firebase/util`, `unrs-resolver`) under npm 11's `allow-scripts` policy. The
  build and the whole site work anyway — verified. Don't chase the warning.
- **The auth pages are genuinely tiny.** `/login`, `/register` and `/admin`
  render ~600 characters because the `(auth)` layout has no header or footer.
  `smoke` flags anything under 400 chars as empty, so that margin is thin — if
  you trim those pages, expect a false failure.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `chrome DevTools never opened on port 9222` | A stale Chrome holds the port: `pkill -f remote-debugging-port`, or run with `CDP_PORT=9223`. |
| `dev server never came up on http://127.0.0.1:3000` | Something else owns 3000: `pkill -f "next dev"`, then retry. |
| `ENOTEMPTY: rmdir '/tmp/ujasiri-chrome-*'` | Chrome kept writing to its profile after SIGTERM. The driver now waits and ignores the failure; the leftover dir in `/tmp` is harmless. |
| A `pkill` command exits 143/144 | That's the signal killing a job in the same compound command, not an error. |
| `smoke` reports a route as failed with 0 console errors and a low char count | Next was still compiling that route. Re-run — the second pass hits a warm server. |
