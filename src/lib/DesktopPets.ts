/**
 * DesktopPets — theme-adaptive "live wallpaper" bugs.
 *
 * Design decisions worth reading:
 *
 * 1. COLOUR.  Bugs never hardcode a hex. Every colour is read at draw time from
 *    the same CSS custom properties the themes define, so the same sprite reads
 *    correctly across default / midnight / retro / vaporwave / terminal without
 *    a second implementation. A MutationObserver on <body data-theme> repaints
 *    all sprites the moment the theme flips.
 *
 * 2. LIVE WALLPAPER, NOT BACKGROUND LAYER.  Bugs sit at z-index 2 — above the
 *    wallpaper (0/1), below every window (20+). Windows are also treated as
 *    real spatial obstacles (see OBSTACLE AVOIDANCE below): a bug steers
 *    around an open window's rectangle rather than walking through it, so it
 *    never ends up resting on a window's edge. The z-index layering is a
 *    second line of defence for the brief moments between obstacle refreshes
 *    (mid-drag, mid-resize) — if a bug is ever caught inside a window's
 *    rect anyway, the window still paints over it and, because painting
 *    order and hit-testing agree, also captures the pointer there, so a bug
 *    can never intercept a click meant for the window. This only works
 *    because the pets layer is a real descendant of #desktop-root (see
 *    Desktop.tsx) sharing its stacking context with every .win element — a
 *    detached <body>-level sibling would NOT correctly compare z-index
 *    against windows, since #desktop-root's own position:fixed always opens
 *    a fresh stacking context that traps its children's z-index values away
 *    from anything outside it.
 *
 * 6. OBSTACLE AVOIDANCE.  Every open (non-minimized) .win element's
 *    getBoundingClientRect() is tracked as a live obstacle rect, refreshed
 *    on window resize and on any class/style DOM mutation under
 *    #desktop-root (open, close, minimize, drag, resize, snap — all of
 *    these change a .win element's class or inline style, so one
 *    MutationObserver covers all of them) plus once up front in start(),
 *    after the window layer has already mounted. A bug never targets a spot
 *    inside an obstacle (padded by OBSTACLE_MARGIN), and if a window opens
 *    or moves into its current path mid-walk, it stops short of the padded
 *    edge and picks a new target instead of continuing in.
 *
 * 3. SMOOTH, CURVED WANDERING.  Movement is heading-based steering, not a
 *    snap-to-axis walk: each bug turns gradually toward a fresh random
 *    target rather than jumping direction, which is what produces the
 *    sweeping curved paths rather than blocky right-angle ones. Each species
 *    gets its own speed/turn-rate pair, so a heavy ladybug banks slowly and
 *    a fly darts and re-turns quickly.
 *
 * 4. SIDE-VIEW ART: FLIP, DON'T ROTATE.  fly and ladybug are drawn as
 *    asymmetric side-view creatures, facing right by construction. They are
 *    never rendered through ctx.rotate() — rotating a side-view body a
 *    quarter turn scrambles its legs/wings/antennae into disconnected
 *    shapes, since there is no "facing up" or "facing down" pose to rotate
 *    into. Horizontal movement flips the sprite via a CSS scaleX(-1) on the
 *    element itself; vertical movement keeps whatever horizontal facing the
 *    bug last had. ant is a simple radially-symmetric-enough silhouette that
 *    *does* still use the rotated 4-direction sheet approach unchanged.
 *
 * 5. SPRITE SHEETS, NOT PER-FRAME DRAW CALLS.  Each species is rendered once
 *    per theme change into two small offscreen sheets — a 4-frame walk cycle
 *    and a 1-frame "happy" pose. ant's sheets hold 4 directions; fly/ladybug's
 *    hold only the one natural pose per frame, since direction is handled by
 *    the CSS flip instead. The animation loop only blits from whichever sheet
 *    applies, which keeps this cheap on a phone. Each species also has its
 *    own tile size (TILE_W/TILE_H) rather than one shared constant — ant
 *    needs a square canvas for its rotation pivot to stay centred; fly and
 *    ladybug don't rotate at all, so they get a wider-than-tall canvas sized
 *    to their actual (larger, post-legibility-pass) silhouette instead.
 */

import type { Store } from "../store";
import { sBoop } from "./audio";

type Species = "ladybug" | "fly" | "ant";
type Direction = 0 | 1 | 2 | 3; // 0=right 1=down 2=left 3=up
type Mood = "idle" | "happy";
type Row = [number, number, number]; // [y, x, width]

interface Pet {
  el: HTMLCanvasElement;
  species: Species;
  tileW: number;
  tileH: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  heading: number; // radians
  dir: Direction;
  faceLeft: boolean; // fly/ladybug only: which way the last horizontal move faced
  speed: number;
  turnRate: number; // radians/frame — the per-species "how sharply can it turn"
  frame: number;
  frameTime: number;
  paused: number;
  hovered: boolean;
  mood: Mood;
}

const FRAMES = 4; // walk-cycle length
const RETARGET_DIST = 6; // "close enough" to a target
const BOOP_PAUSE = 70; // animation frames the happy pose holds for
const BOOP_PHRASES = ["hi!", "boop", "<3", "hello"];
// How far clear of every window edge a bug keeps — it reroutes at this
// distance, not at the literal boundary pixel.
const OBSTACLE_MARGIN = 14;

// fly/ladybug are side-view-only art (see file header #4) and never rotate.
const FLIP_ONLY: Record<Species, boolean> = { ant: false, fly: true, ladybug: true };

// ant's geometry is hand-placed for a square 24px tile (its rotation pivot
// depends on that). fly/ladybug don't rotate, so their canvas is sized to
// their actual (legibility-pass-scaled) silhouette instead of forced square.
const TILE_W: Record<Species, number> = { ant: 24, fly: 44, ladybug: 44 };
const TILE_H: Record<Species, number> = { ant: 24, fly: 38, ladybug: 38 };
const MAX_TILE_W = 44;
const MAX_TILE_H = 38;

// Per-species movement "restriction" — how fast it moves and how sharply it
// can turn. A heavy ladybug banks slowly; a fly darts and re-turns quickly.
const SPECIES_MOVE: Record<Species, { speed: number; turnRate: number }> = {
  ladybug: { speed: 0.26, turnRate: 0.022 },
  fly: { speed: 0.55, turnRate: 0.11 },
  ant: { speed: 0.34, turnRate: 0.045 },
};

function headingToDir(h: number): Direction {
  const deg = (((h * 180) / Math.PI) % 360) + (h < 0 ? 360 : 0);
  if (deg < 45 || deg >= 315) return 0;
  if (deg < 135) return 1;
  if (deg < 225) return 2;
  return 3;
}

// ------- Palette resolver -------------------------------------------------

// Every theme defines these; we translate each species into a swatch set
// pulled from CSS vars, so the same sprite reads across all themes.
interface Swatches {
  body: string;
  bodyDark: string;
  accent: string;
  eye: string;
  outline: string;
  tongue: string;
}

function readVar(name: string): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#000"
  );
}

function palette(species: Species): Swatches {
  // Deliberate mapping: each species picks a *role* from the theme, not a
  // literal hue, so hopping themes never breaks contrast.
  switch (species) {
    case "ladybug":
      return {
        body: readVar("--pink-3"), // shell
        bodyDark: readVar("--accent-3"), // head
        accent: readVar("--pink"), // unused by this geometry, kept for interface parity
        eye: readVar("--white"),
        outline: readVar("--ink"),
        tongue: readVar("--pink-2"),
      };
    case "fly":
      return {
        body: readVar("--ink-soft"),
        bodyDark: readVar("--ink"),
        accent: readVar("--mint"), // wing colour
        eye: readVar("--white"),
        outline: readVar("--ink"),
        tongue: readVar("--pink-2"),
      };
    case "ant":
      return {
        body: readVar("--pink-3"),
        bodyDark: readVar("--accent-3"),
        accent: readVar("--pink"),
        eye: readVar("--white"),
        outline: readVar("--ink"),
        tongue: readVar("--pink-2"), // unused by ant's geometry, required by the type
      };
  }
}

// ------- Sprite sheet generator ------------------------------------------

// Each species draws its own body geometry; the walk cycle is expressed as a
// tiny leg-phase table that gives the four frames a real gait.
const LEG_PHASE = [
  //  [front-L, front-R, mid-L, mid-R, back-L, back-R]  offsets in px
  [0, -1, 0, -1, 0, -1], // frame 0
  [-1, 0, -1, 0, -1, 0], // frame 1
  [0, -1, 0, -1, 0, -1], // frame 2 (mirror-ish of 0)
  [-1, 0, -1, 0, -1, 0], // frame 3
];

/** Fills a set of pixel rows with a 1px outline, then the fill on top. */
function blob(ctx: CanvasRenderingContext2D, rows: Row[], fill: string, outline: string) {
  ctx.fillStyle = outline;
  rows.forEach((r) => {
    ctx.fillRect(r[1] - 1, r[0], r[2] + 2, 1);
    ctx.fillRect(r[1], r[0] - 1, r[2], 1);
    ctx.fillRect(r[1], r[0] + 1, r[2], 1);
  });
  ctx.fillStyle = fill;
  rows.forEach((r) => ctx.fillRect(r[1], r[0], r[2], 1));
}

// Legibility-pass scale for fly/ladybug's geometry (their tile grew from a
// ~32px square to 44×38 to give the shell/wings/legs/antennae room to read
// as separate shapes instead of a blur of adjacent pixels).
const LEGIBILITY_SCALE = 1.375;

function buildSheet(species: Species): HTMLCanvasElement {
  const w = TILE_W[species];
  const h = TILE_H[species];
  const sheet = document.createElement("canvas");
  const p = palette(species);

  if (FLIP_ONLY[species]) {
    // One natural side-view pose per walk frame — no direction rotation.
    sheet.width = w * FRAMES;
    sheet.height = h;
    const ctx = sheet.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    for (let f = 0; f < FRAMES; f++) {
      ctx.save();
      ctx.translate(f * w, 0);
      drawBody(ctx, species, p, f, false);
      ctx.restore();
    }
    return sheet;
  }

  // ant: draw once, rotate for the other 3 directions (unchanged approach).
  sheet.width = w * FRAMES;
  sheet.height = h * 4;
  const ctx = sheet.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  for (let dir = 0; dir < 4; dir++) {
    for (let f = 0; f < FRAMES; f++) {
      ctx.save();
      const tx = f * w;
      const ty = dir * h;
      ctx.translate(tx + w / 2, ty + h / 2);
      ctx.rotate((dir * Math.PI) / 2);
      ctx.translate(-w / 2, -h / 2);
      drawBody(ctx, species, p, f, false);
      ctx.restore();
    }
  }
  return sheet;
}

// A second, much smaller sheet: one static "happy" pose, used while a bug is
// paused after being clicked.
function buildHappySheet(species: Species): HTMLCanvasElement {
  const w = TILE_W[species];
  const h = TILE_H[species];
  const sheet = document.createElement("canvas");
  const p = palette(species);

  if (FLIP_ONLY[species]) {
    sheet.width = w;
    sheet.height = h;
    const ctx = sheet.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    drawBody(ctx, species, p, 0, true);
    return sheet;
  }

  sheet.width = w;
  sheet.height = h * 4;
  const ctx = sheet.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  for (let dir = 0; dir < 4; dir++) {
    ctx.save();
    const ty = dir * h;
    ctx.translate(w / 2, ty + h / 2);
    ctx.rotate((dir * Math.PI) / 2);
    ctx.translate(-w / 2, -h / 2);
    drawBody(ctx, species, p, 0, true);
    ctx.restore();
  }
  return sheet;
}

// Row-based pixel drawing. fly/ladybug geometry is the v7 prototype's exact
// side-view art (positions/proportions), scaled up for legibility and with
// leg-to-body gaps closed so they read as attached rather than floating —
// otherwise untouched: same silhouette, same oversized "googly" eyes, same
// fill colours mapped through the theme palette. ant is unchanged.
function drawBody(
  ctx: CanvasRenderingContext2D,
  species: Species,
  p: Swatches,
  frame: number,
  happy: boolean,
) {
  const legs = LEG_PHASE[frame];

  const rect = (x: number, y: number, w: number, h: number, fill: string) => {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  };

  if (species === "ladybug" || species === "fly") {
    const sc = (n: number) => Math.round(n * LEGIBILITY_SCALE);
    const srect = (x: number, y: number, w: number, h: number, fill: string) =>
      rect(sc(x), sc(y), Math.max(1, sc(w)), Math.max(1, sc(h)), fill);
    const sblob = (rows: Row[], fill: string, outline: string) =>
      blob(
        ctx,
        rows.map((r) => [sc(r[0]), sc(r[1]), Math.max(1, sc(r[2]))] as Row),
        fill,
        outline,
      );

    if (species === "ladybug") {
      // legs — bottom pair's attachment point extended up to the shell edge
      // (closes a gap present in the original coordinates; top pair already
      // touched the shell as given)
      [12, 18, 24].forEach((x, i) => {
        const o = (i + frame) % 2;
        srect(x, 7, 1, 2, p.outline);
        srect(x - 1 + o, 5, 3, 1, p.outline);
        srect(x, 17, 1, 5, p.outline); // was y:19 — extended to meet the shell at y:17
        srect(x - 1 + o, 22, 3, 1, p.outline);
      });
      // shell
      sblob(
        [
          [7, 16, 12],
          [8, 14, 15],
          [9, 12, 18],
          [10, 11, 20],
          [11, 11, 20],
          [12, 11, 20],
          [13, 11, 20],
          [14, 11, 20],
          [15, 12, 18],
          [16, 14, 15],
          [17, 17, 10],
        ],
        p.body,
        p.outline,
      );
      srect(15, 9, 5, 1, p.eye); // gloss
      srect(21, 8, 1, 9, p.outline); // wing seam
      // spots
      [
        [16, 11, 3],
        [24, 10, 4],
        [18, 15, 3],
      ].forEach((s) => srect(s[0], s[1], s[2], s[2], p.outline));
      // head
      sblob(
        [
          [9, 5, 8],
          [10, 3, 11],
          [11, 3, 11],
          [12, 3, 11],
          [13, 3, 11],
          [14, 5, 8],
        ],
        p.bodyDark,
        p.outline,
      );
      if (happy) {
        sblob(
          [
            [9, 4, 7],
            [10, 2, 9],
            [11, 2, 9],
            [12, 2, 9],
            [13, 4, 7],
          ],
          p.eye,
          p.outline,
        );
        sblob(
          [
            [9, 9, 7],
            [10, 7, 9],
            [11, 7, 9],
            [12, 7, 9],
            [13, 9, 7],
          ],
          p.eye,
          p.outline,
        );
      } else {
        sblob(
          [
            [10, 4, 5],
            [11, 3, 7],
            [12, 3, 7],
            [13, 4, 5],
          ],
          p.eye,
          p.outline,
        );
        sblob(
          [
            [10, 9, 5],
            [11, 8, 7],
            [12, 8, 7],
            [13, 9, 5],
          ],
          p.eye,
          p.outline,
        );
      }
      // antennae
      srect(6, 7, 1, 2, p.outline);
      srect(4, 5, 2, 2, p.outline);
      srect(10, 7, 1, 2, p.outline);
      srect(10, 5, 2, 2, p.outline);
      // mouth / tongue dot
      srect(11, 6, happy ? 2 : 1, 1, p.tongue);
    } else {
      // fly
      const up = frame % 2 === 0;
      sblob(
        up
          ? [
              [3, 9, 8],
              [4, 8, 11],
              [5, 9, 10],
            ]
          : [
              [5, 8, 10],
              [6, 7, 12],
              [7, 9, 9],
            ],
        p.accent,
        p.outline,
      );
      sblob(
        up
          ? [
              [2, 20, 9],
              [3, 19, 12],
              [4, 21, 9],
            ]
          : [
              [4, 19, 11],
              [5, 19, 12],
              [6, 22, 8],
            ],
        p.accent,
        p.outline,
      );
      // legs — attachment point extended up to the body edge (closes a gap
      // present in the original coordinates)
      [10, 17, 23].forEach((x, i) => {
        srect(x, 20, 1, 6, p.outline); // was y:23 — extended to meet the body at y:20
        srect(x - 1 + ((i + frame) % 2), 26, 3, 1, p.outline);
      });
      // body
      sblob(
        [
          [9, 11, 13],
          [10, 9, 17],
          [11, 8, 19],
          [12, 7, 21],
          [13, 7, 21],
          [14, 7, 21],
          [15, 7, 21],
          [16, 7, 21],
          [17, 8, 19],
          [18, 8, 19],
          [19, 9, 17],
          [20, 12, 11],
        ],
        p.body,
        p.outline,
      );
      srect(22, 12, 1, 7, p.bodyDark);
      if (happy) {
        sblob(
          [
            [9, 9, 9],
            [10, 8, 11],
            [11, 8, 11],
            [12, 8, 11],
            [13, 8, 11],
            [14, 9, 9],
          ],
          p.eye,
          p.outline,
        );
        sblob(
          [
            [9, 18, 9],
            [10, 17, 11],
            [11, 17, 11],
            [12, 17, 11],
            [13, 17, 11],
            [14, 18, 9],
          ],
          p.eye,
          p.outline,
        );
      } else {
        sblob(
          [
            [10, 9, 7],
            [11, 8, 9],
            [12, 8, 9],
            [13, 8, 9],
            [14, 9, 7],
          ],
          p.eye,
          p.outline,
        );
        sblob(
          [
            [10, 18, 7],
            [11, 17, 9],
            [12, 17, 9],
            [13, 17, 9],
            [14, 18, 7],
          ],
          p.eye,
          p.outline,
        );
      }
      // antennae
      srect(13, 7, 1, 3, p.outline);
      srect(12, 5, 2, 2, p.outline);
      srect(21, 7, 1, 3, p.outline);
      srect(21, 5, 2, 2, p.outline);
      // mouth / tongue dot
      srect(16, happy ? 15 : 14, happy ? 4 : 2, 1, p.tongue);
    }
    return;
  }

  // ant — 3 body segments, deliberately chunky at 24px. Unchanged.
  // 6 legs (longer, angled)
  rect(4, 8 + legs[0], 2, 3, p.outline);
  rect(4, 14 + legs[1], 2, 3, p.outline);
  rect(10, 7 + legs[2], 2, 3, p.outline);
  rect(10, 15 + legs[3], 2, 3, p.outline);
  rect(15, 8 + legs[4], 2, 3, p.outline);
  rect(15, 14 + legs[5], 2, 3, p.outline);
  // abdomen (rear, big oval)
  rect(2, 9, 7, 6, p.outline);
  rect(3, 10, 5, 4, p.body);
  rect(3, 10, 5, 1, p.accent); // gloss band
  // thorax (bridge)
  rect(9, 10, 5, 4, p.outline);
  rect(10, 11, 3, 2, p.bodyDark);
  // head (round)
  rect(14, 9, 5, 6, p.outline);
  rect(15, 10, 3, 4, p.body);
  rect(15, 10, 3, 1, p.accent); // forehead
  // mandibles
  rect(19, 10, 2, 1, p.outline);
  rect(19, 13, 2, 1, p.outline);
  // antennae (long, bent)
  rect(19, 8, 1, 2, p.outline);
  rect(20, 7, 2, 1, p.outline);
  rect(19, 15, 1, 2, p.outline);
  rect(20, 17, 2, 1, p.outline);
  if (happy) {
    // wider curved eyes, small smile
    rect(16, 10, 2, 2, p.eye);
    rect(16, 13, 2, 2, p.eye);
    rect(17, 16, 2, 1, p.eye);
  } else {
    rect(16, 11, 2, 1, p.eye);
    rect(16, 13, 2, 1, p.eye);
  }
}

// ------- The controller ---------------------------------------------------

export class DesktopPets {
  private sheets = new Map<Species, HTMLCanvasElement>();
  private happySheets = new Map<Species, HTMLCanvasElement>();
  private pets: Pet[] = [];
  private raf = 0;
  private reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private themeObserver: MutationObserver | null = null;
  private obstacleObserver: MutationObserver | null = null;
  private obstacles: DOMRect[] = [];
  private container: HTMLElement;
  // Reserved for future use (not read anywhere yet); kept as-is per the
  // module's original constructor signature rather than dropped.
  private store: Store;

  constructor(container: HTMLElement, store: Store) {
    this.container = container;
    this.store = store;
    void this.store;
    this.container.style.pointerEvents = "none";
    this.container.style.position = "fixed";
    this.container.style.inset = "0";
    this.container.style.zIndex = "2"; // above wallpaper (0/1), below windows (20)
  }

  start(count = 7) {
    if (this.reduced) return; // respect user setting
    this.rebuildSheets();
    // Populate obstacles before spawning — the window layer has already
    // mounted (this runs from a Desktop.tsx effect, which fires after the
    // whole tree commits), so every .win element's rect is available now,
    // not just from the first reactive refresh.
    this.watchObstacles();

    // Stagger spawn positions across a grid of zones so a higher bug count
    // doesn't clump in one corner, and interleave species so it doesn't read
    // as the same bug repeated.
    const species: Species[] = ["ladybug", "fly", "ant"];
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const cellW = innerWidth / cols;
    const cellH = innerHeight / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      let x = Math.max(
        16,
        Math.min(
          innerWidth - MAX_TILE_W - 16,
          col * cellW + Math.random() * Math.max(1, cellW - MAX_TILE_W),
        ),
      );
      let y = Math.max(
        16,
        Math.min(
          innerHeight - MAX_TILE_H - 16,
          row * cellH + Math.random() * Math.max(1, cellH - MAX_TILE_H),
        ),
      );
      if (this.blockedAt(x, y, MAX_TILE_W, MAX_TILE_H)) {
        const clear = this.randomSpot();
        x = clear.x;
        y = clear.y;
      }
      this.spawn(species[i % species.length], x, y);
    }
    this.watchTheme();
    this.loop();
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.themeObserver?.disconnect();
    this.obstacleObserver?.disconnect();
    window.removeEventListener("resize", this.refreshObstacles);
    this.pets.forEach((p) => p.el.remove());
    this.pets = [];
  }

  /** Re-reads every open window's rect from the DOM. Cheap enough to call on
   * every relevant DOM mutation — it only runs on actual class/style
   * changes under #desktop-root, not every frame. */
  private refreshObstacles = () => {
    this.obstacles = Array.from(
      document.querySelectorAll<HTMLElement>(".win:not(.win-hidden)"),
    ).map((el) => el.getBoundingClientRect());
  };

  private watchObstacles() {
    this.refreshObstacles();
    window.addEventListener("resize", this.refreshObstacles);
    const root = document.getElementById("desktop-root") ?? document.body;
    this.obstacleObserver = new MutationObserver(this.refreshObstacles);
    this.obstacleObserver.observe(root, {
      attributes: true,
      attributeFilter: ["class", "style"],
      subtree: true,
    });
  }

  /** Would a tileW×tileH box at (x, y) overlap any obstacle, padded by
   * OBSTACLE_MARGIN? */
  private blockedAt(x: number, y: number, tileW: number, tileH: number): boolean {
    for (const r of this.obstacles) {
      if (
        x < r.right + OBSTACLE_MARGIN &&
        x + tileW > r.left - OBSTACLE_MARGIN &&
        y < r.bottom + OBSTACLE_MARGIN &&
        y + tileH > r.top - OBSTACLE_MARGIN
      ) {
        return true;
      }
    }
    return false;
  }

  private rebuildSheets() {
    this.sheets.clear();
    this.happySheets.clear();
    (["ladybug", "fly", "ant"] as Species[]).forEach((sp) => {
      this.sheets.set(sp, buildSheet(sp));
      this.happySheets.set(sp, buildHappySheet(sp));
    });
  }

  private watchTheme() {
    this.themeObserver = new MutationObserver((muts) => {
      if (muts.some((m) => m.attributeName === "data-theme")) {
        this.rebuildSheets();
      }
    });
    this.themeObserver.observe(document.body, { attributes: true });
  }

  private randomSpot(): { x: number; y: number } {
    return {
      x: 16 + Math.random() * (innerWidth - MAX_TILE_W - 32),
      y: 16 + Math.random() * (innerHeight - MAX_TILE_H - 32),
    };
  }

  private spawn(species: Species, startX: number, startY: number) {
    const tileW = TILE_W[species];
    const tileH = TILE_H[species];
    const el = document.createElement("canvas");
    el.width = tileW;
    el.height = tileH;
    el.style.position = "absolute";
    el.style.pointerEvents = "auto"; // hover + click react
    el.style.imageRendering = "pixelated";
    el.style.willChange = "transform";
    el.style.transformOrigin = "center";
    el.style.transform = "translate3d(0,0,0)";
    el.setAttribute("aria-hidden", "true");

    const move = SPECIES_MOVE[species];
    const heading = Math.random() * Math.PI * 2;
    const pet: Pet = {
      el,
      species,
      tileW,
      tileH,
      x: startX,
      y: startY,
      tx: startX,
      ty: startY,
      heading,
      dir: headingToDir(heading),
      faceLeft: Math.cos(heading) < 0,
      speed: move.speed,
      turnRate: move.turnRate,
      frame: 0,
      frameTime: 0,
      paused: 0,
      hovered: false,
      mood: "idle",
    };
    el.addEventListener("mouseenter", () => {
      pet.hovered = true;
      if (pet.mood === "idle") pet.paused = Math.max(pet.paused, 60);
    });
    el.addEventListener("mouseleave", () => {
      pet.hovered = false;
    });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      this.boop(pet);
    });
    this.container.appendChild(el);
    this.pets.push(pet);
    this.pickTarget(pet);
  }

  /** Click-to-boop: happy face, brief pause, a speech bubble, a little chime. */
  private boop(pet: Pet) {
    pet.mood = "happy";
    pet.paused = BOOP_PAUSE;
    sBoop();

    const text = BOOP_PHRASES[Math.floor(Math.random() * BOOP_PHRASES.length)];
    const bubble = document.createElement("div");
    bubble.className = this.reduced ? "pet-bubble reduced" : "pet-bubble";
    bubble.textContent = text;
    bubble.style.left = `${pet.x + pet.tileW / 2}px`;
    bubble.style.top = `${pet.y}px`;
    this.container.appendChild(bubble);
    setTimeout(() => bubble.remove(), 560);
  }

  private pickTarget(pet: Pet) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const { x, y } = this.randomSpot();
      if (!this.blockedAt(x, y, pet.tileW, pet.tileH)) {
        pet.tx = x;
        pet.ty = y;
        return;
      }
    }
    // Every attempt landed inside an obstacle (windows covering nearly the
    // whole screen) — stay put rather than forcing a target into one.
    pet.tx = pet.x;
    pet.ty = pet.y;
  }

  private step(pet: Pet) {
    if (pet.paused > 0) {
      pet.paused--;
      if (pet.paused === 0 && pet.mood === "happy") pet.mood = "idle";
      return;
    }

    const dx = pet.tx - pet.x;
    const dy = pet.ty - pet.y;

    if (Math.hypot(dx, dy) < RETARGET_DIST) {
      // arrived: brief rest, then reroute
      pet.paused = 40 + Math.floor(Math.random() * 90);
      this.pickTarget(pet);
      return;
    }

    // Steer smoothly toward the target instead of snapping — this is what
    // turns the walk into sweeping curves rather than a right-angle grid walk.
    const desired = Math.atan2(dy, dx);
    let diff = desired - pet.heading;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // normalize to [-pi, pi]
    pet.heading += Math.max(-pet.turnRate, Math.min(pet.turnRate, diff));

    const nx = pet.x + Math.cos(pet.heading) * pet.speed;
    const ny = pet.y + Math.sin(pet.heading) * pet.speed;

    if (this.blockedAt(nx, ny, pet.tileW, pet.tileH)) {
      // A window is ahead, inside the avoidance margin — stop short of it
      // (this frame's move is simply not applied) and reroute, rather than
      // continuing in and ending up resting on its edge.
      pet.paused = 20 + Math.floor(Math.random() * 40);
      this.pickTarget(pet);
      return;
    }

    pet.x = Math.max(0, Math.min(innerWidth - pet.tileW, nx));
    pet.y = Math.max(0, Math.min(innerHeight - pet.tileH, ny));
    pet.dir = headingToDir(pet.heading);
    // Only horizontal-dominant movement updates which way a flip-only sprite
    // faces — vertical movement keeps the last horizontal facing (file
    // header #4), so it never looks rotated.
    if (pet.dir === 0) pet.faceLeft = false;
    else if (pet.dir === 2) pet.faceLeft = true;
  }

  private draw(pet: Pet, now: number) {
    const ctx = pet.el.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, pet.tileW, pet.tileH);
    const flipOnly = FLIP_ONLY[pet.species];
    const sheetRowY = flipOnly ? 0 : pet.dir * pet.tileH;

    if (pet.mood === "happy") {
      const sheet = this.happySheets.get(pet.species)!;
      ctx.drawImage(
        sheet,
        0,
        sheetRowY,
        pet.tileW,
        pet.tileH,
        0,
        0,
        pet.tileW,
        pet.tileH,
      );
    } else {
      // 4-frame walk cycle, tied to real time so speed feels consistent
      if (now - pet.frameTime > 120) {
        pet.frame = (pet.frame + 1) % FRAMES;
        pet.frameTime = now;
      }
      const sheet = this.sheets.get(pet.species)!;
      ctx.drawImage(
        sheet,
        pet.frame * pet.tileW,
        sheetRowY,
        pet.tileW,
        pet.tileH,
        0,
        0,
        pet.tileW,
        pet.tileH,
      );
    }

    const flip = flipOnly && pet.faceLeft ? " scaleX(-1)" : "";
    const hover = pet.hovered ? " scale(1.35)" : "";
    pet.el.style.transform =
      `translate3d(${Math.round(pet.x)}px,${Math.round(pet.y)}px,0)` + flip + hover;
  }

  private loop = () => {
    const now = performance.now();
    for (const pet of this.pets) {
      this.step(pet);
      this.draw(pet, now);
    }
    this.raf = requestAnimationFrame(this.loop);
  };
}
