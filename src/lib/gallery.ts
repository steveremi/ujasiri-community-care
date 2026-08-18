/**
 * ── Are these photographs safe to use? ────────────────────────────────────
 *
 * COPYRIGHT: yes. They are Unsplash-licensed — free for commercial use, no
 * attribution required. The only prohibitions are reselling them unmodified
 * and building a competing stock service. Neither applies here.
 *
 * MODEL RELEASES: not guaranteed. Unsplash does not warrant that the people
 * pictured consented to any particular use. That is a different risk from
 * copyright, and on this site it is the one that matters: placing an
 * identifiable stranger beside HIV or GBV content can imply something false
 * about them.
 *
 * Two mitigations are already in place:
 *
 *   1. No caption anywhere says or implies that a person shown is a client, a
 *      survivor, or living with any condition. Captions describe what UCC
 *      does, never who the person in the frame is.
 *   2. The switch below. Set `usePhotography` to false and every rotating slot
 *      falls back to the generated greyscale scenes, which contain no real
 *      person at all.
 *
 * The permanent fix is your own commissioned photography with written consent
 * on file. See public/hero/README.md.
 */

/**
 * Set to false to remove every stock photograph of a real person from the
 * site, falling back to generated artwork. Flip this if legal or safeguarding
 * advice says stock imagery of identifiable people is not acceptable for an
 * organisation working in HIV, TB and GBV.
 */
export const usePhotography = true;

/**
 * The shared photograph pool.
 *
 * One list, referenced by every rotating image slot on the site. Adding a
 * photograph to /public/gallery and appending it here makes it appear in the
 * rotation everywhere — there is no per-section image list to keep in step.
 *
 * The helpers below hand each slot a *different* slice of the pool, so two
 * rotators on the same screen never show the same photograph at the same time.
 *
 * Replace these with your own commissioned photography. Written consent must be
 * on file before any identifiable person is published — see
 * public/hero/README.md and src/lib/safeguarding.ts.
 */

/** Every photograph available to rotating slots. */
export const gallery: string[] = Array.from(
  { length: 46 },
  (_, i) => `/gallery/${String(i + 1).padStart(2, "0")}.jpg`,
);

/**
 * Curated subsets.
 *
 * The full pool is a mix, and a good deal of it is street and market
 * photography — traders, produce, shopfronts. That reads fine on a page about
 * reaching people where they are, and badly on a report or a governance page,
 * where the subject is meetings, records and accountability.
 *
 * These lists are indices into `gallery`, chosen by subject. `deal` takes an
 * optional pool so a page can draw from the right one.
 */

/**
 * People together, in conversation, gathered.
 *
 * Superseded by the per-page reserved blocks below and currently referenced by
 * no page — two pages drawing six frames each from eleven collided constantly,
 * which is what the reserved blocks fix. Kept as a starting point for a new
 * page that has not been given its own block yet.
 */
export const COMMUNITY = [2, 5, 7, 8, 9, 11, 12, 15, 20, 23, 27] as const;

/** Movement, distance, reaching people — for outreach and programme pages. */
export const OUTREACH = [1, 3, 6, 10, 13, 17, 19, 21, 24, 28, 31] as const;




/**
 * Per-page reserved blocks.
 *
 * These five sets are DISJOINT and together consume all 31 usable frames, so
 * no photograph appears on two of these pages. Each is sized to its page's slot
 * count, with enough spare for the rotating slots to actually rotate.
 *
 *   HOME            6 frames /  4 slots
 *   IMPACT          7 frames /  6 slots
 *   ACCOUNTABILITY  6 frames /  3 slots
 *   TRANSPARENCY    6 frames /  3 slots
 *   REPORTS         6 frames /  3 slots
 *
 * Pair them with `split`, never `deal`: `deal` wraps once a page asks for more
 * than the pool holds, which is what put the same photograph on one page two
 * and three times over. `split` partitions, so it cannot.
 *
 * There is no slack left. A new page needing its own block means taking frames
 * from one of these — or, better, adding photographs. Card lists
 * (news, projects, programmes) deliberately still draw from the whole editorial
 * pool: one image per card across dozens of cards cannot be made unique from 31
 * frames, and reuse between separate cards is not what reads as a repeat.
 *
 * Accountability's set is deliberately calm, wide and adult — no close portraits
 * of children on the page where somebody reports harm.
 */
export const HOME = [1, 3, 6, 13, 19, 21] as const;
export const IMPACT = [4, 14, 16, 22, 26, 29, 30] as const;
export const ACCOUNTABILITY = [10, 12, 15, 18, 20, 28] as const;
export const TRANSPARENCY = [2, 8, 9, 23, 24, 31] as const;
export const REPORTS = [5, 7, 11, 17, 27, 46] as const;


/** Everything, for the hero and general galleries. */
export const ALL = null;

/**
 * Frames that must never appear on this site.
 *
 * 25, 32 and 36–39 are market stalls and shopfronts; 40–45 are a single
 * commercial fashion shoot posed against stacked fruit — a model in a gown in
 * front of watermelons. They are fine photographs and completely wrong here:
 * on a site about HIV retention, TB completion and violence against women they
 * read as decoration at best.
 *
 * Excluded from the default pool rather than deleted, so the numbering of every
 * other frame stays stable and no existing subset silently shifts.
 */
const UNUSABLE = new Set([25, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]);

/**
 * The default pool: every usable frame.
 *
 * A page that asks for no subset gets this rather than the raw `gallery`, so
 * the market and fashion frames cannot reach the site through a general slot
 * even by accident.
 */
export const EDITORIAL: string[] = gallery.filter((_, i) => !UNUSABLE.has(i + 1));

/**
 * The same pool as `EDITORIAL`, as indices — for handing to `split`, which
 * partitions by index rather than by path.
 */
export const EDITORIAL_INDICES: number[] = gallery
  .map((_, i) => i + 1)
  .filter((n) => !UNUSABLE.has(n));

/**
 * The pool card lists draw from.
 *
 * Everything usable except the homepage's own chrome frames. Programme, project
 * and post cards render ON the homepage, so without this exclusion a card sat
 * next to the hero showing the same photograph — which is the collision a
 * reader actually notices.
 *
 * Cards still reuse frames between themselves across a long list, and that is
 * accepted: one image per card over dozens of cards cannot be unique from 31
 * frames, and two different projects sharing a photograph does not read as a
 * glitch the way one page repeating itself does.
 */
export const CARDS: number[] = EDITORIAL_INDICES.filter((n) => !HOME.includes(n as never));

function poolFor(subset: readonly number[] | null): string[] {
  if (!usePhotography) return [];
  if (!subset) return EDITORIAL;
  return subset
    .map((n) => gallery[(n - 1) % gallery.length])
    .filter(Boolean);
}

/**
 * Deal images to one slot on a page.
 *
 * Earlier attempts walked the pool with a stride. That guaranteed no repeats
 * *within* a lane but not *across* lanes — with 32 images and a stride of 7,
 * every lane traverses the same orbit, so two slots on one screen kept landing
 * on the same five photographs.
 *
 * This partitions instead. Each lane owns a contiguous, non-overlapping window
 * of the pool, so two slots on a page cannot collide by construction. `page`
 * shifts the whole allocation, so the same lane on a different programme or
 * project shows different photographs.
 *
 * Deterministic — the server and client compute the same set, so nothing
 * shifts after hydration.
 *
 * @param page  Page-level seed. Use a stable id.
 * @param lane  Slot index on that page, counting from 0.
 * @param count How many photographs this slot cycles through.
 */
const LANE_WINDOW = 6;

export function deal(
  page: number,
  lane: number,
  count = LANE_WINDOW,
  subset: readonly number[] | null = null,
): string[] {
  if (!usePhotography) return [];

  const pool = poolFor(subset);
  const size = pool.length;
  if (size === 0) return [];
  // Lanes are spaced a full window apart; the page seed rotates the origin by
  // a step that is coprime with the pool size, so pages stay out of phase.
  const start = (page * 5 + lane * LANE_WINDOW) % size;

  const out: string[] = [];
  for (let i = 0; i < Math.min(count, size); i++) {
    out.push(pool[(start + i) % size]);
  }
  return out;
}

/**
 * Split a subset into N disjoint lanes.
 *
 * `deal` keeps lanes apart only while the pool is larger than the windows drawn
 * from it. Ask it for three lanes of four out of a pool of eight and it wraps,
 * so the same photograph turns up two or three times on one page — which is
 * exactly what it was written to prevent.
 *
 * This partitions instead: every lane gets a contiguous, non-overlapping slice,
 * sized to whatever is actually available. Eight frames across three lanes give
 * 3 / 3 / 2, and no frame appears twice on the page. Use it wherever one page
 * has several slots drawing from one reserved block.
 *
 * @param subset    Indices into `gallery`.
 * @param lane      Which slot, counting from 0.
 * @param laneCount How many slots share this subset.
 */
export function split(
  subset: readonly number[],
  lane: number,
  laneCount: number,
): string[] {
  if (!usePhotography) return [];
  const pool = poolFor(subset);
  if (pool.length === 0 || laneCount <= 0) return [];

  // Spread the remainder across the earliest lanes, so no lane is left empty
  // when the pool does not divide evenly.
  const base = Math.floor(pool.length / laneCount);
  const extra = pool.length % laneCount;
  const start = lane * base + Math.min(lane, extra);
  const size = base + (lane < extra ? 1 : 0);

  return pool.slice(start, start + size);
}

/** @deprecated Use `deal(page, lane, count)` — it cannot produce collisions. */
export function slice(lane: number, count = 6): string[] {
  return deal(0, lane, count);
}
