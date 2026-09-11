import type { ReactNode } from "react";
import { GLYPHS, GLYPH_ROWS } from "../lib/pixelFont";

type PixelWordProps = {
  text: string;
  /** Fill color for the letter at this index (0-based) in `text`. */
  colorFor: (letterIndex: number) => string;
  /** Optional lighter "echo" color rendered offset behind the letter, for
   * a blocky drop-shadow look — return null/undefined for no shadow on
   * that letter. */
  shadowFor?: (letterIndex: number) => string | null | undefined;
  /** Pixel size of one bitmap cell. */
  cell?: number;
  /** Gap between letters, in cells. */
  gap?: number;
};

// Shadow copy sits down-and-left of the main letter, in cell fractions —
// same "offset ghost" language used elsewhere on the site (e.g. the old
// CSS text-shadow treatment this replaced).
const SHADOW_DX = -0.35;
const SHADOW_DY = 0.35;

/**
 * Renders a word as chunky rectangular pixel blocks from the hand-built
 * bitmap font in lib/pixelFont.ts — not a font-family, not an <img>. Each
 * letter can carry its own color, so "who" and "ami" can be styled
 * differently within one word. Every letter is a bitmap glyph (same pixel
 * grid, same cell size), so they're all naturally the same height already —
 * no per-letter size fixups needed.
 */
export function PixelWord({ text, colorFor, shadowFor, cell = 14, gap = 1 }: PixelWordProps) {
  let cursorCol = 0;
  const shadowRects: ReactNode[] = [];
  const mainRects: ReactNode[] = [];

  // Padding so a shadow offset outward from the leftmost/bottommost cells
  // never gets clipped by the viewBox.
  const pad = cell * 0.6;

  text.split("").forEach((ch, letterIndex) => {
    const glyph = GLYPHS[ch];
    if (!glyph) {
      cursorCol += 4;
      return;
    }
    const color = colorFor(letterIndex);
    const shadowColor = shadowFor?.(letterIndex);
    glyph.forEach((row, ry) => {
      row.forEach((bit, rx) => {
        if (!bit) return;
        const x = pad + (cursorCol + rx) * cell;
        const y = pad + ry * cell;
        if (shadowColor) {
          shadowRects.push(
            <rect
              key={`sh-${letterIndex}-${ry}-${rx}`}
              x={x + SHADOW_DX * cell}
              y={y + SHADOW_DY * cell}
              width={cell}
              height={cell}
              fill={shadowColor}
            />,
          );
        }
        mainRects.push(
          <rect key={`${letterIndex}-${ry}-${rx}`} x={x} y={y} width={cell} height={cell} fill={color} />,
        );
      });
    });
    cursorCol += glyph[0].length + gap;
  });

  const widthPx = Math.max(0, cursorCol - gap) * cell + pad * 2;
  const heightPx = GLYPH_ROWS * cell + pad * 2;

  return (
    <svg
      className="pixel-word"
      width={widthPx}
      height={heightPx}
      viewBox={`0 0 ${widthPx} ${heightPx}`}
      aria-hidden="true"
    >
      {shadowRects}
      {mainRects}
    </svg>
  );
}
