import type { Project } from "../types";

export type IconKind =
  | "folder"
  | "user"
  | "pdf"
  | "mail"
  | "trophy"
  | "cap"
  | "chip"
  | "term"
  | "chart"
  | "brush"
  | "globe"
  | "pointer";

const OUT = "#3d2560";

/** A row is [y, x, width] — one 1px-tall pixel strip. Ported verbatim from the prototype. */
type Row = [number, number, number];

/** Fills a set of pixel rows, with a 1px outline traced around them unless outline===false. */
export function blob(
  c: CanvasRenderingContext2D,
  rows: Row[],
  fill: string,
  outline = true,
) {
  if (outline) {
    c.fillStyle = OUT;
    rows.forEach((r) => {
      c.fillRect(r[1] - 1, r[0], r[2] + 2, 1);
      c.fillRect(r[1], r[0] - 1, r[2], 1);
      c.fillRect(r[1], r[0] + 1, r[2], 1);
    });
  }
  c.fillStyle = fill;
  rows.forEach((r) => c.fillRect(r[1], r[0], r[2], 1));
}

/** Draws a hand-specified pixel icon into a <canvas>, scaled to fill it. No image files. */
export function drawIcon(cv: HTMLCanvasElement, kind: IconKind) {
  const c = cv.getContext("2d");
  if (!c) return;
  c.imageSmoothingEnabled = false;
  const S = cv.width / 40;
  c.setTransform(S, 0, 0, S, 0, 0);
  c.clearRect(0, 0, 40, 40);
  const PAPER = "#fffaff",
    SHADE = "#d9c9ef",
    INK = "#7c5fbf",
    FOLD = "#e7c6f0",
    FOLD_LT = "#f6e2fa",
    FOLD_DK = "#c193d6",
    PINK = "#f6c6dd",
    PINK_D = "#d06a9c",
    MINT = "#a8ddc6",
    SCRN = "#3d2560";

  if (kind === "folder") {
    blob(
      c,
      [
        [12, 7, 24],
        [13, 6, 26],
        [14, 6, 26],
        [15, 6, 26],
        [16, 6, 26],
        [17, 6, 26],
      ],
      FOLD_DK,
    );
    blob(
      c,
      [
        [6, 15, 15],
        [7, 14, 17],
        [8, 14, 17],
        [9, 14, 17],
        [10, 14, 17],
        [11, 14, 17],
        [12, 14, 17],
        [13, 14, 17],
        [14, 14, 17],
        [15, 14, 17],
        [16, 14, 17],
        [17, 14, 17],
      ],
      PAPER,
    );
    c.fillStyle = INK;
    [9, 11, 13, 15].forEach((y, i) => c.fillRect(16 + i, y, 11 - i * 2, 1));
    c.fillStyle = SHADE;
    c.fillRect(27, 8, 3, 10);
    blob(
      c,
      [
        [18, 5, 29],
        [19, 4, 31],
        [20, 4, 31],
        [21, 4, 31],
        [22, 4, 31],
        [23, 4, 31],
        [24, 4, 31],
        [25, 4, 31],
        [26, 4, 31],
        [27, 4, 31],
        [28, 4, 31],
        [29, 4, 31],
        [30, 5, 29],
      ],
      FOLD,
    );
    c.fillStyle = FOLD_LT;
    c.fillRect(6, 19, 27, 1);
    c.fillStyle = FOLD_DK;
    c.fillRect(5, 29, 29, 1);
    let s = 11;
    for (let i = 0; i < 22; i++) {
      s = (s * 29 + 13) % 251;
      c.fillRect(7 + (s % 25), 21 + (s % 8), 1, 1);
    }
  } else if (kind === "user") {
    blob(
      c,
      [
        [5, 6, 28],
        [6, 5, 30],
        [7, 5, 30],
        [8, 5, 30],
        [9, 5, 30],
        [10, 5, 30],
        [11, 5, 30],
        [12, 5, 30],
        [13, 5, 30],
        [14, 5, 30],
        [15, 5, 30],
        [16, 5, 30],
        [17, 5, 30],
        [18, 5, 30],
        [19, 5, 30],
        [20, 5, 30],
        [21, 5, 30],
        [22, 5, 30],
        [23, 5, 30],
        [24, 5, 30],
        [25, 6, 28],
      ],
      PAPER,
    );
    blob(
      c,
      [
        [9, 15, 10],
        [10, 13, 14],
        [11, 12, 16],
        [12, 12, 16],
        [13, 12, 16],
        [14, 12, 16],
        [15, 12, 16],
        [16, 12, 16],
        [17, 13, 14],
        [18, 14, 12],
      ],
      "#5a3f86",
      false,
    );
    blob(
      c,
      [
        [12, 16, 8],
        [13, 15, 10],
        [14, 15, 10],
        [15, 15, 10],
        [16, 16, 8],
        [17, 17, 6],
      ],
      "#f0c8b0",
      false,
    );
    c.fillStyle = SCRN;
    c.fillRect(17, 14, 2, 2);
    c.fillRect(21, 14, 2, 2);
    c.fillStyle = PINK_D;
    c.fillRect(18, 17, 4, 1);
    blob(
      c,
      [
        [20, 10, 20],
        [21, 9, 22],
        [22, 9, 22],
        [23, 9, 22],
        [24, 9, 22],
      ],
      "#5a3f86",
      false,
    );
    c.fillStyle = PINK;
    c.fillRect(9, 22, 22, 2);
  } else if (kind === "pdf") {
    blob(
      c,
      [
        [4, 10, 20],
        [5, 9, 22],
        [6, 9, 22],
        [7, 9, 22],
        [8, 9, 22],
        [9, 9, 22],
        [10, 9, 22],
        [11, 9, 22],
        [12, 9, 22],
        [13, 9, 22],
        [14, 9, 22],
        [15, 9, 22],
        [16, 9, 22],
        [17, 9, 22],
        [18, 9, 22],
        [19, 9, 22],
        [20, 9, 22],
        [21, 9, 22],
        [22, 9, 22],
        [23, 9, 22],
        [24, 9, 22],
        [25, 9, 22],
        [26, 9, 22],
        [27, 9, 22],
        [28, 9, 22],
        [29, 9, 22],
        [30, 9, 22],
        [31, 9, 22],
        [32, 9, 22],
        [33, 10, 20],
      ],
      PAPER,
    );
    c.fillStyle = SHADE;
    c.fillRect(24, 5, 7, 6);
    c.fillStyle = OUT;
    c.fillRect(24, 5, 1, 6);
    c.fillRect(24, 11, 7, 1);
    c.fillStyle = INK;
    [15, 17, 19].forEach((y) => c.fillRect(13, y, 15, 1));
    blob(
      c,
      [
        [23, 11, 18],
        [24, 11, 18],
        [25, 11, 18],
        [26, 11, 18],
        [27, 11, 18],
        [28, 11, 18],
      ],
      PINK_D,
    );
    c.fillStyle = PAPER;
    c.fillRect(14, 25, 2, 2);
    c.fillRect(19, 25, 2, 2);
    c.fillRect(24, 25, 2, 2);
  } else if (kind === "mail") {
    blob(
      c,
      [
        [11, 5, 30],
        [12, 4, 32],
        [13, 4, 32],
        [14, 4, 32],
        [15, 4, 32],
        [16, 4, 32],
        [17, 4, 32],
        [18, 4, 32],
        [19, 4, 32],
        [20, 4, 32],
        [21, 4, 32],
        [22, 4, 32],
        [23, 4, 32],
        [24, 4, 32],
        [25, 4, 32],
        [26, 4, 32],
        [27, 4, 32],
        [28, 5, 30],
      ],
      PINK,
    );
    c.fillStyle = PINK_D;
    for (let i = 0; i < 13; i++) {
      c.fillRect(5 + i, 13 + i, 2, 1);
      c.fillRect(34 - i, 13 + i, 2, 1);
    }
    c.fillStyle = PAPER;
    c.fillRect(15, 20, 10, 7);
    c.fillStyle = PINK_D;
    c.fillRect(17, 22, 6, 1);
    c.fillRect(17, 24, 6, 1);
  } else if (kind === "trophy") {
    const G = "#e8c45f",
      GD = "#b8912f",
      GL = "#f7e39c";
    blob(
      c,
      [
        [7, 12, 16],
        [8, 11, 18],
        [9, 11, 18],
        [10, 11, 18],
        [11, 11, 18],
        [12, 11, 18],
        [13, 12, 16],
        [14, 13, 14],
        [15, 15, 10],
        [16, 16, 8],
      ],
      G,
    );
    c.fillStyle = GL;
    c.fillRect(14, 9, 3, 5);
    c.fillStyle = GD;
    c.fillRect(24, 9, 3, 6);
    blob(
      c,
      [
        [8, 6, 5],
        [9, 6, 3],
        [10, 6, 3],
        [11, 6, 3],
        [12, 7, 4],
      ],
      G,
    );
    blob(
      c,
      [
        [8, 29, 5],
        [9, 31, 3],
        [10, 31, 3],
        [11, 31, 3],
        [12, 29, 4],
      ],
      G,
    );
    c.fillStyle = GD;
    c.fillRect(18, 17, 4, 6);
    blob(
      c,
      [
        [23, 14, 12],
        [24, 13, 14],
      ],
      G,
    );
    blob(
      c,
      [
        [26, 10, 20],
        [27, 9, 22],
        [28, 9, 22],
      ],
      GD,
    );
    c.fillStyle = GL;
    c.fillRect(19, 10, 2, 5);
    c.fillRect(17, 12, 6, 1);
  } else if (kind === "cap") {
    const CAP = "#4a3570",
      CAP_L = "#6a4fa0",
      G = "#e8c45f";
    blob(
      c,
      [
        [8, 18, 4],
        [9, 15, 10],
        [10, 12, 16],
        [11, 9, 22],
        [12, 6, 28],
        [13, 9, 22],
        [14, 12, 16],
        [15, 15, 10],
        [16, 18, 4],
      ],
      CAP,
    );
    c.fillStyle = CAP_L;
    c.fillRect(14, 11, 12, 1);
    blob(
      c,
      [
        [15, 13, 14],
        [16, 13, 14],
        [17, 13, 14],
        [18, 13, 14],
        [19, 14, 12],
        [20, 15, 10],
      ],
      "#5a3f86",
    );
    c.fillStyle = CAP_L;
    c.fillRect(14, 16, 12, 1);
    c.fillStyle = G;
    c.fillRect(29, 13, 2, 9);
    blob(
      c,
      [
        [22, 27, 6],
        [23, 27, 6],
        [24, 28, 4],
      ],
      G,
    );
  } else if (kind === "chip") {
    blob(
      c,
      [
        [10, 10, 20],
        [11, 10, 20],
        [12, 10, 20],
        [13, 10, 20],
        [14, 10, 20],
        [15, 10, 20],
        [16, 10, 20],
        [17, 10, 20],
        [18, 10, 20],
        [19, 10, 20],
        [20, 10, 20],
        [21, 10, 20],
        [22, 10, 20],
        [23, 10, 20],
        [24, 10, 20],
        [25, 10, 20],
        [26, 10, 20],
        [27, 10, 20],
        [28, 10, 20],
        [29, 10, 20],
      ],
      "#5a3f86",
    );
    c.fillStyle = MINT;
    c.fillRect(15, 15, 10, 10);
    c.fillStyle = OUT;
    for (let i = 0; i < 4; i++) {
      c.fillRect(6, 13 + i * 5, 4, 2);
      c.fillRect(30, 13 + i * 5, 4, 2);
      c.fillRect(13 + i * 5, 6, 2, 4);
      c.fillRect(13 + i * 5, 30, 2, 4);
    }
  } else if (kind === "chart") {
    const bar = (x: number, top: number, w: number, bottom: number): Row[] => {
      const rows: Row[] = [];
      for (let y = top; y <= bottom; y++) rows.push([y, x, w]);
      return rows;
    };
    blob(c, bar(6, 22, 6, 32), PINK);
    blob(c, bar(15, 14, 6, 32), MINT);
    blob(c, bar(24, 18, 6, 32), FOLD_DK);
    blob(c, bar(33, 9, 6, 32), "#5a3f86");
  } else if (kind === "brush") {
    blob(
      c,
      [
        [10, 10, 20],
        [11, 8, 24],
        [12, 6, 28],
        [13, 6, 28],
        [14, 6, 28],
        [15, 6, 28],
        [16, 6, 28],
        [17, 6, 28],
        [18, 6, 28],
        [19, 6, 28],
        [20, 8, 24],
        [21, 10, 20],
        [22, 13, 14],
      ],
      FOLD,
    );
    c.fillStyle = PINK_D;
    c.fillRect(12, 12, 4, 4);
    c.fillStyle = MINT;
    c.fillRect(19, 10, 4, 4);
    c.fillStyle = "#5a3f86";
    c.fillRect(26, 13, 4, 4);
    c.fillStyle = "#e8c45f";
    c.fillRect(19, 17, 4, 4);
  } else if (kind === "globe") {
    blob(
      c,
      [
        [6, 14, 12],
        [7, 10, 20],
        [8, 8, 24],
        [9, 7, 26],
        [10, 6, 28],
        [11, 6, 28],
        [12, 5, 30],
        [13, 5, 30],
        [14, 5, 30],
        [15, 5, 30],
        [16, 5, 30],
        [17, 5, 30],
        [18, 5, 30],
        [19, 5, 30],
        [20, 6, 28],
        [21, 6, 28],
        [22, 7, 26],
        [23, 8, 24],
        [24, 10, 20],
        [25, 14, 12],
      ],
      MINT,
    );
    c.fillStyle = OUT;
    c.fillRect(20, 6, 1, 19);
    c.fillRect(6, 15, 28, 1);
    c.fillStyle = "#5a3f86";
    c.fillRect(12, 10, 6, 2);
    c.fillRect(24, 20, 6, 2);
  } else if (kind === "pointer") {
    blob(
      c,
      [
        [8, 9, 2],
        [9, 9, 4],
        [10, 9, 6],
        [11, 9, 8],
        [12, 9, 10],
        [13, 9, 12],
        [14, 9, 14],
        [15, 9, 10],
        [16, 9, 6],
        [17, 15, 5],
        [18, 16, 5],
        [19, 17, 5],
        [20, 18, 4],
      ],
      "#5a3f86",
    );
    c.fillStyle = PAPER;
    c.fillRect(11, 11, 2, 2);
    c.fillRect(11, 14, 2, 2);
    c.fillRect(15, 14, 2, 2);
  } else {
    /* term */
    blob(
      c,
      [
        [6, 4, 32],
        [7, 3, 34],
        [8, 3, 34],
        [9, 3, 34],
        [10, 3, 34],
        [11, 3, 34],
        [12, 3, 34],
        [13, 3, 34],
        [14, 3, 34],
        [15, 3, 34],
        [16, 3, 34],
        [17, 3, 34],
        [18, 3, 34],
        [19, 3, 34],
        [20, 3, 34],
        [21, 3, 34],
        [22, 3, 34],
        [23, 3, 34],
        [24, 3, 34],
        [25, 3, 34],
        [26, 3, 34],
        [27, 4, 32],
      ],
      SCRN,
    );
    c.fillStyle = PINK;
    c.fillRect(7, 12, 3, 2);
    c.fillStyle = MINT;
    c.fillRect(12, 12, 10, 2);
    c.fillStyle = "#c7b3ec";
    c.fillRect(7, 17, 16, 2);
    c.fillRect(7, 21, 11, 2);
    c.fillStyle = PINK;
    c.fillRect(21, 21, 3, 2);
    blob(
      c,
      [
        [30, 10, 20],
        [31, 9, 22],
        [32, 9, 22],
      ],
      FOLD_DK,
    );
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

/** Reads the live theme colour the bouquet's stems use. */
function leafGreen(): string {
  return getComputedStyle(document.body).getPropertyValue("--mint").trim();
}

const BOUQUET_W = 36;
const BOUQUET_H = 26;
const BOUQUET_STEMS = 6;

function bouquetStemPath(i: number) {
  const baseX = BOUQUET_W / 2;
  const baseY = BOUQUET_H - 1;
  // -1 (far left) .. +1 (far right), symmetric
  const t0 = (i - (BOUQUET_STEMS - 1) / 2) / ((BOUQUET_STEMS - 1) / 2);
  return {
    baseX,
    baseY,
    spread: t0 * 12,
    height: 18 - Math.abs(t0) * 4,
    curl: -t0 * 3,
  };
}

export type BouquetLeafSpot = { x: number; y: number };

/** The tip position of every bouquet stem, in the same 36x26 coordinate
 * space drawBouquet draws in — so a real <img> leaf can be positioned
 * exactly where a canvas-drawn leaflet used to sit. See PixelBouquet.tsx. */
export function bouquetLeafSpots(): BouquetLeafSpot[] {
  return Array.from({ length: BOUQUET_STEMS }, (_, i) => {
    const { baseX, baseY, spread, height, curl } = bouquetStemPath(i);
    const ease = 1; // t=1 (the tip): smoothstep(1) = 1
    return {
      x: baseX + spread * ease + curl * Math.sin(Math.PI),
      y: baseY - height,
    };
  });
}

/**
 * The one dense bouquet accent, sitting directly below ROOT: several
 * curling stems converging at a single point at the bottom and fanning up
 * and outward. There is no separate pot/planter shape — the branch lines'
 * own silhouette (wide top, narrowing through here, widening again below)
 * is what reads as "growing out of something." Stems are flat-fill/thin-
 * outline, colour read live from --mint. The leaflets themselves are real
 * <img> elements (see PixelBouquet.tsx, bouquetLeafSpots), not drawn here.
 */
export function drawBouquet(cv: HTMLCanvasElement) {
  const c = cv.getContext("2d");
  if (!c) return;
  c.imageSmoothingEnabled = false;
  const S = cv.width / BOUQUET_W;
  c.setTransform(S, 0, 0, S, 0, 0);
  c.clearRect(0, 0, BOUQUET_W, BOUQUET_H);

  const green = leafGreen();

  for (let i = 0; i < BOUQUET_STEMS; i++) {
    const { baseX, baseY, spread, height, curl } = bouquetStemPath(i);
    const steps = 11;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const ease = t * t * (3 - 2 * t); // smoothstep — gives the curl its taper
      const x = baseX + spread * ease + curl * Math.sin(t * Math.PI);
      const y = baseY - height * t;
      const px = Math.round(x);
      const py = Math.round(y);
      c.fillStyle = OUT;
      c.fillRect(px - 1, py, 3, 2);
      c.fillStyle = green;
      c.fillRect(px, py, 1, 2);
    }
  }

  c.setTransform(1, 0, 0, 1, 0, 0);
}

/** Deterministic procedural project thumbnail — seeded from the project id, themed from CSS vars. */
export function drawThumb(cv: HTMLCanvasElement, proj: Project, w: number, h: number) {
  const c = cv.getContext("2d");
  if (!c) return;
  c.imageSmoothingEnabled = false;
  cv.width = w;
  cv.height = h;

  let seed = 0;
  for (const ch of proj.id) seed = (seed * 31 + ch.charCodeAt(0)) % 99991;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const cs = getComputedStyle(document.body);
  const A = cs.getPropertyValue("--accent").trim();
  const B = cs.getPropertyValue("--pink-2").trim();
  const C = cs.getPropertyValue("--panel-3").trim();
  const D = cs.getPropertyValue("--accent-3").trim();
  const M = cs.getPropertyValue("--mint").trim();

  c.fillStyle = C;
  c.fillRect(0, 0, w, h);
  const cell = 8;
  for (let y = 0; y < h; y += cell)
    for (let x = 0; x < w; x += cell) {
      const r = rnd();
      if (r > 0.86) {
        c.fillStyle = [A, B, D, M][Math.floor(rnd() * 4)];
        c.fillRect(x, y, cell, cell);
      } else if (r > 0.72) {
        c.fillStyle = A;
        c.globalAlpha = 0.25;
        c.fillRect(x, y, cell, cell);
        c.globalAlpha = 1;
      }
    }

  // a "window" motif so it reads as a screenshot stand-in
  const wx = Math.floor(w * 0.16),
    wy = Math.floor(h * 0.22),
    ww = Math.floor(w * 0.68),
    wh = Math.floor(h * 0.56);
  c.fillStyle = cs.getPropertyValue("--panel").trim();
  c.fillRect(wx, wy, ww, wh);
  c.fillStyle = D;
  c.fillRect(wx, wy, ww, 9);
  c.fillStyle = cs.getPropertyValue("--ink-dim").trim();
  for (let i = 0; i < 4; i++)
    c.fillRect(wx + 8, wy + 18 + i * 9, Math.floor(ww * (0.3 + rnd() * 0.55)), 3);
  c.strokeStyle = OUT;
  c.lineWidth = 2;
  c.strokeRect(wx + 1, wy + 1, ww - 2, wh - 2);
}
