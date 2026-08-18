#!/usr/bin/env node
/**
 * Driver for the Ujasiri Community Care site.
 *
 * Drives the running app through the Chrome DevTools Protocol so an agent can
 * navigate, click, read the DOM, capture screenshots and collect console errors
 * without a human at a browser.
 *
 * Zero dependencies on purpose. This container has no chromium-cli, no
 * Playwright, no Puppeteer, no tmux and no network to install them with — but it
 * does have /usr/bin/google-chrome, and Node 24 ships a global WebSocket. That
 * pair is a complete browser driver, so this file is the whole harness.
 *
 * Usage (from my-app/):
 *   node .claude/skills/run-ujasiri/driver.mjs smoke
 *   node .claude/skills/run-ujasiri/driver.mjs shot /partners
 *   node .claude/skills/run-ujasiri/driver.mjs text /partners
 *   node .claude/skills/run-ujasiri/driver.mjs eval /  "document.title"
 *   node .claude/skills/run-ujasiri/driver.mjs click / "header a[href='/donate']"
 *
 * Env:
 *   BASE_URL   default http://127.0.0.1:3000
 *   SHOT_DIR   default ./.screenshots
 *   CDP_PORT   default 9222
 *   HEADFUL=1  show the browser (needs a display; useless in this container)
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const SHOT_DIR = process.env.SHOT_DIR ?? ".screenshots";
const CDP_PORT = Number(process.env.CDP_PORT ?? 9222);
/** e.g. VIEWPORT=360x800 to drive the site as a phone. Unset = desktop. */
const VIEWPORT = process.env.VIEWPORT ?? "";

/**
 * Routes worth checking. `/gallery` is deliberately absent: there is a
 * src/lib/gallery.ts and 46 images in public/gallery, but no route — the lib
 * feeds the homepage rotator. Adding it here would report a false failure.
 */
const ROUTES = [
  "/",
  "/about",
  "/team",
  "/programs",
  "/projects",
  "/impact",
  "/news",
  "/stories",
  "/partners",
  "/get-help",
  "/get-involved",
  "/get-involved/volunteer",
  "/careers",
  "/opportunities",
  "/donate",
  "/contact",
  "/governance",
  "/accountability",
  "/transparency",
  "/reports",
  "/privacy",
  "/terms",
  "/accessibility",
  "/login",
  "/register",
  "/admin",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ server -- */

async function serverIsUp() {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(4000) });
    return res.status > 0;
  } catch {
    return false;
  }
}

/**
 * Reuses an already-running dev server when it finds one. Restarting Next on
 * every driver run would throw away its compiled-route cache, and a cold route
 * in dev takes seconds to compile.
 */
async function ensureServer() {
  if (await serverIsUp()) return { started: false, stop: async () => {} };

  const proc = spawn("npm", ["run", "dev"], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  let log = "";
  proc.stdout.on("data", (d) => (log += d));
  proc.stderr.on("data", (d) => (log += d));

  for (let i = 0; i < 60; i++) {
    await sleep(1000);
    if (await serverIsUp()) {
      return {
        started: true,
        stop: async () => {
          try {
            process.kill(-proc.pid, "SIGTERM");
          } catch {}
        },
      };
    }
    if (proc.exitCode !== null) break;
  }
  throw new Error(`dev server never came up on ${BASE_URL}\n${log}`);
}

/* ------------------------------------------------------------------ chrome -- */

async function launchChrome() {
  const profile = await mkdtemp(join(tmpdir(), "ujasiri-chrome-"));
  const args = [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profile}`,
    // --no-sandbox is required: this container has no user namespaces, and
    // Chrome's zygote dies at startup without it.
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--window-size=1440,900",
    "about:blank",
  ];
  if (!process.env.HEADFUL) args.unshift("--headless=new");

  const proc = spawn("google-chrome", args, { stdio: "ignore", detached: true });

  // Poll the DevTools endpoint rather than sleeping a fixed amount.
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`, {
        signal: AbortSignal.timeout(1000),
      });
      const info = await res.json();
      return {
        wsUrl: info.webSocketDebuggerUrl,
        stop: async () => {
          try {
            process.kill(-proc.pid, "SIGTERM");
          } catch {}
          // Chrome keeps writing to its profile for a moment after SIGTERM, so
          // an immediate recursive rm loses a race with it and throws
          // ENOTEMPTY. Give it a beat, and never let cleanup fail the run —
          // the profile is in /tmp and the screenshot is already on disk.
          await sleep(500);
          await rm(profile, { recursive: true, force: true }).catch(() => {});
        },
      };
    } catch {}
  }
  throw new Error(`chrome DevTools never opened on port ${CDP_PORT}`);
}

/* --------------------------------------------------------------------- cdp -- */

/** Minimal CDP client: request/response correlation plus event listeners. */
class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        for (const fn of this.listeners) fn(msg);
      }
    });
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", () => reject(new Error(`cdp connect failed: ${url}`)), {
        once: true,
      });
    });
    return new Cdp(ws);
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, sessionId }));
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`cdp timeout: ${method}`));
      }, 60_000);
    });
  }

  on(fn) {
    this.listeners.push(fn);
  }

  close() {
    this.ws.close();
  }
}

/**
 * One page, with console/error capture wired up before any navigation so
 * nothing that fires during first paint is missed.
 */
async function openPage(cdp) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

  const problems = [];
  cdp.on((msg) => {
    if (msg.sessionId !== sessionId) return;
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
      problems.push(
        `console.error: ${msg.params.args.map((a) => a.value ?? a.description ?? "?").join(" ")}`,
      );
    }
    if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      problems.push(`exception: ${d.exception?.description ?? d.text}`);
    }
  });

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);

  // Optional phone/tablet emulation, e.g. VIEWPORT=360x800. Touch emulation
  // goes with it deliberately: several components branch on the `hover` and
  // `pointer` media queries, so a narrow desktop window is not the same thing
  // as a phone and would audit the wrong stylesheet.
  if (VIEWPORT) {
    const [w, h] = VIEWPORT.split("x").map(Number);
    await cdp.send(
      "Emulation.setDeviceMetricsOverride",
      { width: w, height: h, deviceScaleFactor: 3, mobile: true, screenWidth: w, screenHeight: h },
      sessionId,
    );
    await cdp.send(
      "Emulation.setTouchEmulationEnabled",
      { enabled: true, maxTouchPoints: 5 },
      sessionId,
    );
  }

  const loadEvent = () =>
    new Promise((resolve) => {
      const fn = (msg) => {
        if (msg.sessionId === sessionId && msg.method === "Page.loadEventFired") {
          cdp.listeners.splice(cdp.listeners.indexOf(fn), 1);
          resolve();
        }
      };
      cdp.on(fn);
      // Next dev compiles a route on first request, so a cold page can take
      // several seconds. Resolve anyway and let the caller assert on content.
      setTimeout(() => {
        const i = cdp.listeners.indexOf(fn);
        if (i >= 0) cdp.listeners.splice(i, 1);
        resolve();
      }, 45_000);
    });

  return {
    problems,

    async goto(path) {
      const wait = loadEvent();
      await cdp.send("Page.navigate", { url: new URL(path, BASE_URL).href }, sessionId);
      await wait;
      // Lets React hydrate before anything is read or clicked.
      await sleep(400);
    },

    async eval(expression) {
      const { result, exceptionDetails } = await cdp.send(
        "Runtime.evaluate",
        { expression, returnByValue: true, awaitPromise: true },
        sessionId,
      );
      if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? "eval failed");
      return result.value;
    },

    /**
     * Scrolls the whole page, then returns to the top.
     *
     * `captureBeyondViewport` renders the full height in one pass but never
     * fires the intersection observers behind `loading="lazy"`, so every image
     * below the fold stays unloaded and the screenshot comes back with blank
     * bands where the photography should be. Walking the page first forces
     * them in. Verified: without this, two of the six images on /accountability
     * report naturalWidth 0.
     */
    async settleLazyImages() {
      await this.eval(`
        (async () => {
          const step = window.innerHeight;
          const end = document.body.scrollHeight;
          for (let y = 0; y < end; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
          window.scrollTo(0, 0);
          await Promise.all(
            Array.from(document.images)
              .filter((img) => !img.complete)
              .map((img) => new Promise((r) => {
                img.addEventListener("load", r, { once: true });
                img.addEventListener("error", r, { once: true });
                setTimeout(r, 3000);
              })),
          );
        })()
      `);
      await sleep(300);
    },

    /**
     * Scrolls the first element matching `selector` to the top of the viewport.
     * Pair with `shot(name, { viewport: true })` to review one section of a
     * long page — this site's pages run to 5,000+ pixels, and a full-page PNG
     * downsamples too far to judge type or spacing.
     */
    async scrollTo(selector) {
      const ok = await this.eval(`
        (() => {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return false;
          window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 16);
          return true;
        })()
      `);
      if (!ok) throw new Error(`no element matched: ${selector}`);
      await sleep(600);
    },

    async shot(name, { viewport = false } = {}) {
      if (!viewport) await this.settleLazyImages();
      await mkdir(SHOT_DIR, { recursive: true });
      const { data } = await cdp.send(
        "Page.captureScreenshot",
        { format: "png", captureBeyondViewport: !viewport },
        sessionId,
      );
      const file = join(SHOT_DIR, `${name}.png`);
      await writeFile(file, Buffer.from(data, "base64"));
      return file;
    },

    /**
     * Fills fields by `name` within a form, then submits it.
     *
     * Assigning to `.value` is not enough on a React-controlled input: React
     * tracks the last value it wrote on the DOM node, sees no change, and drops
     * the event — the field then reverts on submit. Going through the prototype
     * setter clears that tracker, which is what makes the input event stick.
     */
    async submit(formSelector, fields) {
      const filled = await this.eval(`
        (() => {
          const form = document.querySelector(${JSON.stringify(formSelector)});
          if (!form) return { ok: false, why: "form not found" };
          const values = ${JSON.stringify(fields)};
          for (const [name, value] of Object.entries(values)) {
            const el = form.elements[name];
            if (!el) return { ok: false, why: "no field named " + name };
            const proto = el instanceof HTMLTextAreaElement
              ? HTMLTextAreaElement.prototype
              : el instanceof HTMLSelectElement
                ? HTMLSelectElement.prototype
                : HTMLInputElement.prototype;
            Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }
          return { ok: true };
        })()
      `);
      if (!filled.ok) throw new Error(`submit failed: ${filled.why}`);

      await this.eval(`
        document.querySelector(${JSON.stringify(formSelector)})
          .querySelector('button[type="submit"]').click()
      `);
      // Server Actions round-trip to the server; give it time to come back.
      await sleep(3000);
    },

    async click(selector) {
      const ok = await this.eval(`
        (() => {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return false;
          el.scrollIntoView({ block: "center" });
          el.click();
          return true;
        })()
      `);
      if (!ok) throw new Error(`no element matched: ${selector}`);
      await sleep(1200);
    },
  };
}

/* ------------------------------------------------------------------ actions -- */

/** Slug safe for a filename: "/" -> "home", "/get-involved/volunteer" -> "get-involved-volunteer". */
const slug = (route) => route.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home";

async function withPage(fn) {
  const server = await ensureServer();
  const chrome = await launchChrome();
  const cdp = await Cdp.connect(chrome.wsUrl);
  try {
    return await fn(await openPage(cdp));
  } finally {
    cdp.close();
    await chrome.stop();
    await server.stop();
  }
}

/**
 * Every route, with HTTP status, a rendered-content assertion and console
 * errors. Screenshots the pages most likely to regress visually.
 */
async function smoke() {
  const SHOOT = new Set(["/", "/partners", "/programs", "/donate", "/admin"]);
  const failures = [];

  await withPage(async (page) => {
    for (const route of ROUTES) {
      const before = page.problems.length;
      const res = await fetch(new URL(route, BASE_URL), { redirect: "follow" });
      await page.goto(route);

      const info = await page.eval(`({
        title: document.title,
        h1: document.querySelector("h1")?.innerText ?? "",
        chars: document.body.innerText.length,
      })`);

      const errs = page.problems.slice(before);
      // A shell that renders header + footer but no page body still clears
      // 400 characters, so this catches only a hard render failure.
      const empty = info.chars < 400;
      const bad = res.status >= 400 || empty || errs.length > 0;
      if (bad) {
        failures.push({ route, status: res.status, chars: info.text, errors: errs });
      }

      let shot = "";
      if (SHOOT.has(route)) shot = ` -> ${await page.shot(slug(route))}`;
      console.log(
        `${bad ? "FAIL" : " ok "}  ${String(res.status).padEnd(3)}  ${route.padEnd(26)}  ${String(info.chars).padStart(6)} chars  ${info.h1.slice(0, 42)}${shot}`,
      );
      for (const e of errs) console.log(`        ! ${e}`);
    }
  });

  console.log(
    failures.length ? `\n${failures.length} route(s) failed` : `\nall ${ROUTES.length} routes ok`,
  );
  return failures.length === 0;
}

/* --------------------------------------------------------------------- cli -- */

const [cmd, ...rest] = process.argv.slice(2);

const commands = {
  smoke: async () => {
    if (!(await smoke())) process.exitCode = 1;
  },

  shot: async () => {
    const route = rest[0] ?? "/";
    await withPage(async (page) => {
      await page.goto(route);
      console.log(await page.shot(rest[1] ?? slug(route)));
      for (const p of page.problems) console.log(`! ${p}`);
    });
  },

  text: async () => {
    const route = rest[0] ?? "/";
    await withPage(async (page) => {
      await page.goto(route);
      console.log(await page.eval("document.body.innerText"));
    });
  },

  eval: async () => {
    const [route = "/", expression] = rest;
    if (!expression) throw new Error("usage: eval <route> <js-expression>");
    await withPage(async (page) => {
      await page.goto(route);
      console.log(JSON.stringify(await page.eval(expression), null, 2));
    });
  },

  /** section <route> <css-selector> [name] — viewport-sized shot of one section */
  section: async () => {
    const [route = "/", selector, name] = rest;
    if (!selector) throw new Error("usage: section <route> <css-selector> [name]");
    await withPage(async (page) => {
      await page.goto(route);
      await page.settleLazyImages();
      await page.scrollTo(selector);
      console.log(await page.shot(name ?? `${slug(route)}-section`, { viewport: true }));
    });
  },

  /** submit <route> <form-selector> '<json fields>' */
  submit: async () => {
    const [route, formSelector, json] = rest;
    if (!route || !formSelector || !json) {
      throw new Error(`usage: submit <route> <form-selector> '{"name":"value"}'`);
    }
    await withPage(async (page) => {
      await page.goto(route);
      await page.submit(formSelector, JSON.parse(json));
      console.log(await page.eval("document.body.innerText"));
      console.log(await page.shot("after-submit"));
      for (const p of page.problems) console.log(`! ${p}`);
    });
  },

  click: async () => {
    const [route = "/", selector] = rest;
    if (!selector) throw new Error("usage: click <route> <css-selector>");
    await withPage(async (page) => {
      await page.goto(route);
      await page.click(selector);
      console.log(`url after click: ${await page.eval("location.pathname")}`);
      console.log(await page.shot("after-click"));
      for (const p of page.problems) console.log(`! ${p}`);
    });
  },
};

if (!commands[cmd]) {
  console.error(`usage: driver.mjs <${Object.keys(commands).join("|")}> [args]`);
  process.exit(2);
}

await commands[cmd]();
// Chrome and Next both leave handles behind; nothing above needs the loop.
process.exit(process.exitCode ?? 0);
