import type { ReactNode } from "react";

/**
 * Pixel-art / LEGO-stud portrait — not an image asset. The tile map below
 * was generated once by block-sampling the actual /public/images/potrait.jpg
 * (480x480) into a 32x32 grid, classifying each block's average color to the
 * nearest of 5 categories (black/blue/purple/gray/white), then flood-filling
 * the background from the grid's edges to separate it from the interior
 * white eye tiles. That's why this matches the real portrait's silhouette
 * and color layout rather than being a generic guess.
 *
 * Every tile's fill is a theme CSS custom property, not a literal color, so
 * the portrait recolors automatically on theme change — same technique as
 * PixelWord.tsx: the browser resolves var() on the SVG fill attribute
 * through the normal CSS cascade.
 */

const COLS = 32;
const ROWS = 32;
const CELL = 15;

// One char per tile: . = background (not rendered), k = black, b = blue,
// p = purple, g = gray, w = white.
const GRID: string[] = [
  // The sampled grid originally had two blank rows here, then jumped
  // straight to a 16-cell-wide flat band below — no rounding at all above
  // it, which read as the top of the head being sliced off rather than
  // domed. These two rows add a tapering cap (2 cells, then 10 cells) so
  // the silhouette actually rounds into the wider band beneath it.
  "...............ppp..............",
  "...........bbpppppppk..........",
  "........bbbbppppppppppk........",
  ".......bbbbbpppppppppppk.......",
  "......bbbbbbbpppppppppppk......",
  ".....gbbbbbbbpppppppppbppb.....",
  ".....gbbbbbbbbpppppppbbbpb.....",
  "....gbbbbbbbbbbbpppbbbbbppb....",
  "....gbbkkkkbbbbbbbbbbkkkbpb....",
  "....bbkkkkkkkbbbbbbkkkkkkpbg...",
  "...gkbkkkkkkkkbbbbkkkkkkkbbb...",
  "...gkbkkkkkkkkkbbkkkkkkkkkbb...",
  "...gkbkkwkkkkkkbkkkkkkkwkkbb....",
  "...gkbkkwkbbkkkkkkkkbbkwkkpb....",
  "...gbbkkwkbwkkkkkkkkwbkwkkpb...",
  "...gbbkkwwkkkwkkkkwkkkwwkkpb...",
  "...bbbkkkwwwwkkbkkkwwwwkkbpbg..",
  "..gbbbkkkkbbkkkbkkkbbbkkkbpbb..",
  ".gbbbbkkkbbggbkkkbbgggbkkkppbg.",
  ".gkbbbkkbbbbgggkbggggggkkbppbb.",
  "gbbbbbkkkbbbgggbggggggkkkbpppbg",
  "gkbbbbbkkkbbbgbkkggggkkkbbpppbb",
  "gkbbbbpkkkkkbbbbbggkkkkkbppppbb",
  ".gbbbbppkkkkkkbggkkkkkkbbppppbg",
  "..gbbbbppkkkkkkbbbkkkkbbppppbg.",
  "...gbbbpppkkkbbbbgkkkbbbpppbg..",
  "....gbbbpppkkbbbggkkbbbppbb....",
  "......bkbbppbkbggkkbbppkb......",
  "........bkkbppbkkbbbkkk........",
  "...........bkkkkkkkk...........",
  "................................",
  "................................",
];

// Dedicated portrait-only tokens (themes.css), not the generic accent-2/-3
// tokens — those vary too unpredictably by theme (accent-3 is dark purple in
// the default theme, brown in retro, green in terminal), which collapsed
// the blue and purple rings into a single indistinguishable color. This
// illustration needs blue and purple to always read as genuinely different
// hues, so each theme defines its own explicit --portrait-blue/-purple pair.
// --portrait-dark/-light (not --ink/--white) — --ink is the theme's *text*
// color, which is light in dark themes (e.g. midnight's --ink is a pale
// blue), so reusing it for the face's black interior went light-on-light
// against the white eye tiles in those themes and lost all contrast.
// --portrait-dark/-light are defined per theme specifically to stay dark
// and light respectively, so the face never loses its own internal
// contrast regardless of overall theme mood.
const FILL: Record<string, string> = {
  k: "var(--portrait-dark)",
  b: "var(--portrait-blue)",
  p: "var(--portrait-purple)",
  g: "var(--ink-soft)",
  w: "var(--portrait-light)",
};

// Dark categories get a faint light stud highlight; light/mid categories
// get a faint dark one — keeps the "tiny LEGO stud" detail restrained and
// theme-independent, since it's a contrast trick, not a color choice.
const DARK_CATEGORIES = new Set(["k", "b", "p"]);

type PixelPortraitProps = { className?: string };

export function PixelPortrait({ className }: PixelPortraitProps) {
  const tiles: ReactNode[] = [];
  const bevels: ReactNode[] = [];
  const studs: ReactNode[] = [];

  for (let y = 0; y < ROWS; y++) {
    const row = GRID[y];
    for (let x = 0; x < COLS; x++) {
      const code = row[x];
      if (!FILL[code]) continue;

      const fill = FILL[code];

      const px = x * CELL;
      const py = y * CELL;
      // Deterministic per-tile brightness jitter so flat color bands read
      // as many individual pieces rather than one solid fill.
      const jitter = ((x * 31 + y * 17) % 5) / 40;
      tiles.push(
        <rect
          key={`${x}-${y}`}
          x={px}
          y={py}
          width={CELL}
          height={CELL}
          fill={fill}
          fillOpacity={1 - jitter}
          stroke="rgba(0,0,0,0.22)"
          strokeWidth={0.6}
        />,
      );
      // Simple directional bevel (light from upper-left) — a thin bright
      // sliver on the top/left edges, a thin dark sliver on the bottom/
      // right edges. Gives every tile a "proper" embossed 3D edge instead
      // of the flat stud highlight alone.
      const BEVEL = 2.2;
      bevels.push(
        <rect key={`bt-${x}-${y}`} x={px} y={py} width={CELL} height={BEVEL} fill="rgba(255,255,255,0.16)" />,
        <rect key={`bl-${x}-${y}`} x={px} y={py} width={BEVEL} height={CELL} fill="rgba(255,255,255,0.16)" />,
        <rect
          key={`bb-${x}-${y}`}
          x={px}
          y={py + CELL - BEVEL}
          width={CELL}
          height={BEVEL}
          fill="rgba(0,0,0,0.22)"
        />,
        <rect
          key={`br-${x}-${y}`}
          x={px + CELL - BEVEL}
          y={py}
          width={BEVEL}
          height={CELL}
          fill="rgba(0,0,0,0.22)"
        />,
      );
      const isDark = DARK_CATEGORIES.has(code);
      studs.push(
        <circle
          key={`s${x}-${y}`}
          cx={px + CELL / 2}
          cy={py + CELL / 2}
          r={CELL * 0.2}
          fill={isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)"}
        />,
      );
    }
  }

  return (
    <svg
      className={className ? `pixel-portrait ${className}` : "pixel-portrait"}
      viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
      role="img"
      aria-label="Pixel-art portrait"
    >
      {tiles}
      {bevels}
      {studs}
    </svg>
  );
}
