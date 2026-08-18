import { cn } from "@/lib/utils";

/**
 * Greyscale placeholder artwork for the hero slideshow.
 *
 * These are NOT photographs and are not pretending to be. They are generated
 * SVG scenes — a horizon, a sun, landscape forms and human silhouettes — drawn
 * in greyscale so the hero reads unmistakably as "a photograph belongs here",
 * while still giving each slide a distinct composition so the transitions are
 * reviewable before any real imagery exists.
 *
 * Every scene below is unique: different horizon height, sun position, terrain
 * profile, and arrangement of figures. Nothing repeats.
 *
 * REPLACE THESE. Real photography is not a nice-to-have for this organisation:
 * a site about HIV, TB and GBV that uses stock imagery of people who never
 * consented is doing the exact thing our safeguarding policy forbids. Commission
 * photographs of your own work, with written consent on file, and drop the paths
 * into `defaultHeroSlides` in hero-carousel.tsx.
 */

interface Scene {
  /** 0–1, where the horizon sits vertically. */
  horizon: number;
  /** 0–1 across the frame. */
  sunX: number;
  sunR: number;
  /** Terrain silhouette, as a polyline of [x, y] pairs in 0–100 space. */
  terrain: [number, number][];
  /** Standing figures: [x, scale]. */
  figures: [number, number][];
  /** Vertical forms — trees, poles, posts: [x, height]. */
  verticals: [number, number][];
  /** Low structures — buildings, tents: [x, width, height]. */
  structures: [number, number, number][];
}

/** Twelve hand-tuned compositions, one per hero slide. */
const SCENES: Scene[] = [
  { horizon: 0.62, sunX: 0.78, sunR: 7, terrain: [[0, 66], [22, 61], [44, 68], [68, 59], [100, 65]], figures: [[24, 1], [33, 0.86]], verticals: [[80, 20]], structures: [] },
  { horizon: 0.58, sunX: 0.2, sunR: 9, terrain: [[0, 60], [30, 55], [55, 62], [78, 54], [100, 60]], figures: [[58, 0.72], [66, 0.66], [74, 0.7]], verticals: [], structures: [[12, 18, 12]] },
  { horizon: 0.66, sunX: 0.55, sunR: 6, terrain: [[0, 70], [18, 64], [40, 71], [64, 63], [88, 69], [100, 66]], figures: [[16, 0.94]], verticals: [[70, 26], [77, 18]], structures: [] },
  { horizon: 0.54, sunX: 0.86, sunR: 8, terrain: [[0, 57], [26, 50], [52, 58], [80, 49], [100, 56]], figures: [[36, 0.8], [45, 0.9], [54, 0.76]], verticals: [[8, 22]], structures: [] },
  { horizon: 0.7, sunX: 0.34, sunR: 5, terrain: [[0, 74], [24, 69], [50, 75], [72, 67], [100, 73]], figures: [[62, 1.05]], verticals: [], structures: [[20, 26, 16]] },
  { horizon: 0.6, sunX: 0.66, sunR: 10, terrain: [[0, 63], [20, 57], [46, 65], [70, 56], [100, 62]], figures: [[28, 0.68], [35, 0.74], [42, 0.7], [49, 0.64]], verticals: [[88, 24]], structures: [] },
  { horizon: 0.64, sunX: 0.12, sunR: 7, terrain: [[0, 67], [28, 62], [56, 69], [82, 61], [100, 67]], figures: [[70, 0.92], [79, 0.82]], verticals: [[16, 28]], structures: [[40, 20, 13]] },
  { horizon: 0.56, sunX: 0.72, sunR: 6, terrain: [[0, 59], [22, 53], [48, 60], [74, 51], [100, 58]], figures: [[12, 0.78], [20, 0.88]], verticals: [[56, 21], [63, 27], [69, 17]], structures: [] },
  { horizon: 0.68, sunX: 0.44, sunR: 9, terrain: [[0, 72], [30, 66], [58, 73], [84, 65], [100, 71]], figures: [[48, 0.96], [57, 0.7]], verticals: [], structures: [[74, 22, 15]] },
  { horizon: 0.52, sunX: 0.9, sunR: 5, terrain: [[0, 55], [24, 49], [50, 56], [76, 48], [100, 54]], figures: [[30, 0.84], [38, 0.72], [46, 0.9], [54, 0.66]], verticals: [[10, 25]], structures: [] },
  { horizon: 0.72, sunX: 0.28, sunR: 8, terrain: [[0, 76], [26, 70], [54, 77], [80, 69], [100, 75]], figures: [[66, 1]], verticals: [[86, 23], [92, 16]], structures: [[14, 24, 14]] },
  { horizon: 0.6, sunX: 0.5, sunR: 11, terrain: [[0, 64], [18, 58], [38, 66], [60, 57], [82, 65], [100, 61]], figures: [[24, 0.74], [31, 0.88], [39, 0.8], [47, 0.7], [55, 0.86]], verticals: [], structures: [] },
];

/** A simple standing figure: head plus a tapered body. */
function Figure({ x, y, scale }: { x: number; y: number; scale: number }) {
  const h = 13 * scale;
  const headR = 1.5 * scale;
  const bodyTop = y - h + headR * 2.2;
  const bodyW = 3.2 * scale;

  return (
    <g fill="#0f1115" opacity={0.82}>
      <circle cx={x} cy={y - h} r={headR} />
      <path
        d={`M ${x - bodyW / 2} ${y}
            L ${x - bodyW / 2.6} ${bodyTop}
            Q ${x} ${bodyTop - 1.2 * scale} ${x + bodyW / 2.6} ${bodyTop}
            L ${x + bodyW / 2} ${y} Z`}
      />
    </g>
  );
}

export function HeroPlaceholder({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  const scene = SCENES[index % SCENES.length];
  const horizonY = scene.horizon * 100;
  const id = `hp${index}`;

  const terrainPath =
    `M 0 100 L 0 ${scene.terrain[0][1]} ` +
    scene.terrain.map(([x, y]) => `L ${x} ${y}`).join(" ") +
    " L 100 100 Z";

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn("size-full", className)}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5e646d" />
          <stop offset="60%" stopColor="#8d939b" />
          <stop offset="100%" stopColor="#b9bec5" />
        </linearGradient>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3c4046" />
          <stop offset="100%" stopColor="#1d2025" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#e8eaed" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e8eaed" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="100" height="100" fill={`url(#${id}-sky)`} />

      {/* Sun and its haze — the one warm-feeling element, kept greyscale. */}
      <circle cx={scene.sunX * 100} cy={horizonY - 16} r={scene.sunR * 2.6} fill={`url(#${id}-glow)`} />
      <circle cx={scene.sunX * 100} cy={horizonY - 16} r={scene.sunR} fill="#dfe2e6" opacity={0.75} />

      {/* Distant ridge, lighter than the foreground for depth. */}
      <path
        d={`M 0 ${horizonY} Q 25 ${horizonY - 5} 50 ${horizonY - 1} T 100 ${horizonY - 3} L 100 100 L 0 100 Z`}
        fill="#6f757d"
        opacity={0.55}
      />

      {/* Structures sit on the horizon, behind the terrain. */}
      {scene.structures.map(([x, w, h], i) => (
        <g key={`s${i}`} fill="#2a2e34" opacity={0.7}>
          <rect x={x} y={horizonY - h} width={w} height={h} />
          <path d={`M ${x - 2} ${horizonY - h} L ${x + w / 2} ${horizonY - h - 5} L ${x + w + 2} ${horizonY - h} Z`} />
        </g>
      ))}

      {scene.verticals.map(([x, h], i) => (
        <g key={`v${i}`} fill="#22262b" opacity={0.78}>
          <rect x={x - 0.5} y={horizonY - h} width={1} height={h} />
          <ellipse cx={x} cy={horizonY - h} rx={4.5} ry={2.8} />
          <ellipse cx={x - 2.6} cy={horizonY - h + 2.4} rx={3.4} ry={2.1} />
          <ellipse cx={x + 2.8} cy={horizonY - h + 2} rx={3.2} ry={2} />
        </g>
      ))}

      <path d={terrainPath} fill={`url(#${id}-ground)`} />

      {scene.figures.map(([x, scale], i) => (
        <Figure key={`f${i}`} x={x} y={horizonY + 4 + i * 1.5} scale={scale} />
      ))}

      {/* Fine grain, so the panel reads as an image surface rather than flat
          vector fill. */}
      <rect
        width="100"
        height="100"
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.04}
        strokeWidth={0.4}
        strokeDasharray="0.5 2.5"
      />
    </svg>
  );
}
