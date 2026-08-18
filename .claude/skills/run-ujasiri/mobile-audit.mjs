#!/usr/bin/env node
/**
 * Mobile responsiveness audit for the Ujasiri Community Care site.
 *
 * Loads every route at a set of real device widths and reports the things that
 * actually break a phone layout, measured in the page rather than guessed at
 * from the source:
 *
 *   - horizontal overflow (the page scrolls sideways) and which elements cause it
 *   - tap targets below the 44x44 CSS-px minimum
 *   - body text below 12px
 *   - images with no intrinsic size / overflowing their column
 *
 * Same zero-dependency CDP approach as driver.mjs — see that file's header for
 * why there is no Playwright here.
 *
 *   node .claude/skills/run-ujasiri/mobile-audit.mjs            # all routes, all widths
 *   node .claude/skills/run-ujasiri/mobile-audit.mjs / /donate  # only these routes
 *
 * Env: BASE_URL (default http://127.0.0.1:3000), CDP_PORT (default 9222).
 */

import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const CDP_PORT = Number(process.env.CDP_PORT ?? 9222);

/** The widths that matter. 320 is the narrowest phone still in real use
 *  (iPhone SE 1st gen / low-end Android), 360 is the single most common Android
 *  width in Kenya, 390 is the modern iPhone, 768 is the tablet breakpoint. */
const VIEWPORTS = [
  { name: "320w", width: 320, height: 800, dsf: 2, mobile: true },
  { name: "360w", width: 360, height: 800, dsf: 3, mobile: true },
  { name: "390w", width: 390, height: 844, dsf: 3, mobile: true },
  { name: "768w", width: 768, height: 1024, dsf: 2, mobile: true },
];

const ROUTES = [
  "/", "/about", "/team", "/programs", "/programs/hiv-prevention",
  "/projects", "/projects/pima-community-hiv-testing", "/impact", "/news",
  "/news/annual-report-2025-published", "/stories", "/partners", "/get-help",
  "/get-help/hiv", "/get-help/gbv", "/get-involved", "/get-involved/volunteer",
  "/get-involved/partner", "/get-involved/fundraise", "/careers",
  "/careers/agyw-mentor-kakamega", "/opportunities", "/donate", "/contact",
  "/governance", "/accountability", "/transparency", "/reports", "/privacy",
  "/terms", "/accessibility", "/login", "/register", "/admin",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* --------------------------------------------------------------- the probe -- */

/**
 * Runs inside the page. Returns plain data only — it is stringified across the
 * CDP boundary, so it may not close over anything from this module.
 */
const PROBE = `(() => {
  const vw = window.innerWidth;
  const doc = document.documentElement;

  // --- horizontal overflow -------------------------------------------------
  // scrollWidth on <html> is the honest measure: it accounts for absolutely
  // positioned and transformed children that a width check on <body> misses.
  const overflowBy = Math.max(0, doc.scrollWidth - vw);

  const offenders = [];
  if (overflowBy > 1) {
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      // Only elements that actually extend past the viewport edge, and only the
      // outermost such element in a chain — a wide child inside a wide parent
      // is one bug, not two.
      const right = r.left + r.width;
      if (right <= vw + 1 && r.left >= -1) continue;
      const parent = el.parentElement;
      if (parent) {
        const pr = parent.getBoundingClientRect();
        if (pr.left + pr.width > vw + 1 || pr.left < -1) continue;
      }
      const cs = getComputedStyle(el);
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 160),
        text: (el.innerText || "").trim().slice(0, 60).replace(/\\s+/g, " "),
        left: Math.round(r.left),
        width: Math.round(r.width),
        overflow: Math.round(r.left + r.width - vw),
        overflowX: cs.overflowX,
        whiteSpace: cs.whiteSpace,
        minWidth: cs.minWidth,
      });
      if (offenders.length >= 12) break;
    }
  }

  // --- tap targets ---------------------------------------------------------
  // WCAG 2.2 AA (2.5.8) is 24px; Apple/Google both say 44. We measure against
  // 44 but only report visible, non-inline-in-prose controls, because a link
  // inside a paragraph is explicitly exempt from the WCAG requirement.
  const small = [];
  for (const el of document.querySelectorAll("a[href], button, input, select, textarea, [role=button]")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    if (el.type === "hidden") continue;
    // Inline links flowing inside a text block: exempt.
    const parentTag = el.parentElement ? el.parentElement.tagName.toLowerCase() : "";
    const inProse = el.tagName === "A" && ["p", "li", "span", "label", "dd", "td"].includes(parentTag);
    if (inProse) continue;
    if (r.width < 44 || r.height < 44) {
      small.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 120),
        text: (el.innerText || el.getAttribute("aria-label") || el.getAttribute("name") || "").trim().slice(0, 40),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
  }

  // --- tiny text -----------------------------------------------------------
  const tiny = [];
  const seenTiny = new Set();
  for (const el of document.querySelectorAll("body *")) {
    if (!el.childNodes.length) continue;
    // Only elements with their own text, so we measure the element that sets
    // the size rather than every ancestor that inherits it.
    const ownText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
    if (!ownText) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 12) {
      const key = el.tagName + "|" + size + "|" + (el.className || "");
      if (seenTiny.has(key)) continue;
      seenTiny.add(key);
      tiny.push({
        tag: el.tagName.toLowerCase(),
        px: size,
        cls: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 120),
        text: ownText.slice(0, 50),
      });
    }
  }

  // --- images --------------------------------------------------------------
  const badImages = [];
  for (const img of document.querySelectorAll("img")) {
    const r = img.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.left + r.width > vw + 1) {
      badImages.push({ src: (img.currentSrc || img.src).slice(-70), w: Math.round(r.width), over: Math.round(r.left + r.width - vw) });
    }
  }

  // --- horizontal scroll containers ---------------------------------------
  // A table or code block that scrolls inside its own box is correct; one that
  // pushes the page wide is not. Report which is which.
  const scrollers = [];
  for (const el of document.querySelectorAll("table, pre, [class*=overflow-x]")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    const cs = getComputedStyle(el);
    const contained = ["auto", "scroll"].includes(cs.overflowX);
    if (el.scrollWidth > el.clientWidth + 1 && !contained) {
      scrollers.push({ tag: el.tagName.toLowerCase(), cls: (el.className || "").toString().slice(0, 100), scrollW: el.scrollWidth, clientW: el.clientWidth });
    }
  }

  return {
    vw,
    scrollWidth: doc.scrollWidth,
    overflowBy,
    offenders,
    small,
    tiny,
    badImages,
    scrollers,
    h1: (document.querySelector("h1") || {}).innerText || null,
  };
})()`;

/* --------------------------------------------------------------- chrome/cdp -- */

async function launchChrome() {
  const profile = await mkdtemp(join(tmpdir(), "ujasiri-mobile-"));
  const proc = spawn(
    "google-chrome",
    [
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${profile}`,
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "about:blank",
    ],
    { detached: true, stdio: "ignore" },
  );

  for (let i = 0; i < 60; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`, {
        signal: AbortSignal.timeout(1000),
      });
      const { webSocketDebuggerUrl } = await res.json();
      return {
        wsUrl: webSocketDebuggerUrl,
        async close() {
          try {
            process.kill(-proc.pid, "SIGTERM");
          } catch {}
          await sleep(500);
          await rm(profile, { recursive: true, force: true }).catch(() => {});
        },
      };
    } catch {}
  }
  throw new Error(`chrome DevTools never opened on port ${CDP_PORT}`);
}

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
      ws.addEventListener("error", () => reject(new Error("cdp connect failed")), { once: true });
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

/* -------------------------------------------------------------------- main -- */

const routes = process.argv.slice(2).filter((a) => a.startsWith("/"));
const targets = routes.length ? routes : ROUTES;

const chrome = await launchChrome();
const cdp = await Cdp.connect(chrome.wsUrl);
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
await cdp.send("Page.enable", {}, sessionId);
await cdp.send("Runtime.enable", {}, sessionId);

const findings = [];

for (const vp of VIEWPORTS) {
  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dsf,
      mobile: vp.mobile,
      screenWidth: vp.width,
      screenHeight: vp.height,
    },
    sessionId,
  );
  // Touch emulation changes which CSS media queries match (hover/pointer), and
  // several components branch on those — without it we would be auditing the
  // desktop stylesheet at a narrow width, which is not the same thing.
  await cdp.send(
    "Emulation.setTouchEmulationEnabled",
    { enabled: true, maxTouchPoints: 5 },
    sessionId,
  );

  for (const route of targets) {
    await cdp.send("Page.navigate", { url: new URL(route, BASE_URL).href }, sessionId);
    await sleep(1100); // load + hydrate; pages are prebuilt so this is ample
    let r;
    try {
      const { result } = await cdp.send(
        "Runtime.evaluate",
        { expression: PROBE, returnByValue: true, awaitPromise: false },
        sessionId,
      );
      r = result.value;
    } catch (e) {
      findings.push({ vp: vp.name, route, error: String(e).slice(0, 120) });
      continue;
    }
    if (!r) continue;

    const issues = [];
    if (r.overflowBy > 1) issues.push(`OVERFLOW +${r.overflowBy}px`);
    if (r.small.length) issues.push(`${r.small.length} small tap targets`);
    if (r.tiny.length) issues.push(`${r.tiny.length} tiny text`);
    if (r.badImages.length) issues.push(`${r.badImages.length} overflowing images`);
    if (r.scrollers.length) issues.push(`${r.scrollers.length} unscrollable wide blocks`);

    if (issues.length) findings.push({ vp: vp.name, route, ...r, summary: issues.join(", ") });
  }
}

cdp.close();
await chrome.close();

console.log(JSON.stringify(findings, null, 2));
console.error(
  `\n${findings.length} route/viewport combinations with findings out of ${targets.length * VIEWPORTS.length} checked.`,
);
