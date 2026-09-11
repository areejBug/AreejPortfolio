/**
 * Hand-built blocky pixel letterforms — not a font file, not a font-family.
 * Each glyph is a small bitmap (1 = filled cell); PixelWord.tsx renders each
 * filled cell as one SVG rect. Only the letters "whoami" actually needs are
 * defined; extend this table if more letters are needed later.
 *
 * Genuinely lowercase, not just small capitals: rows 0–1 are the ascender
 * zone (only "h" reaches into it, for its stem); rows 2–6 are the x-height
 * body that "w", "o", "a", "m" sit entirely within, same as real lowercase
 * letterforms. "i" gets a dot in the ascender zone and a short x-height stem.
 */
export type Glyph = number[][];

export const GLYPH_ROWS = 7;

export const GLYPHS: Record<string, Glyph> = {
  // Tall ascender stem + x-height arch — reads as lowercase h, not capital H.
  h: [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
  ],
  // x-height only (top two rows empty) — short and wide like lowercase w.
  w: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0],
  ],
  // x-height only — round, not the taller two-story capital O.
  o: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  // Single-story bowl + stem, x-height only — lowercase a, not triangular A.
  // Every filled cell connects to its neighbor (closed bowl, no floating
  // pixels) so it reads as one letter, not scattered noise.
  a: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1],
    [1, 0, 0, 1, 1],
    [0, 1, 1, 1, 1],
  ],
  // x-height only — two flat-topped humps with a dip between them at the
  // top-middle, so the middle leg starts a row lower than the outer two
  // (a proper two-hump m, not one continuous flat bar).
  m: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0],
    [1, 0, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1],
  ],
  // Dotted tittle above a short x-height stem — lowercase i, not a full-
  // height capital I bar. Dot is 3 rows tall (was 2 with a blank spacer
  // row beneath it) — one extra pixel added on top so the dot reads as a
  // clear, solid mark instead of a thin sliver.
  i: [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
};
