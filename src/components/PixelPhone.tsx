import { useRef, useState, type TransitionEvent } from "react";
import { CONTENT } from "../content";
import { usePrefersReducedMotion } from "../lib/useMediaQuery";
import phoneSvgRaw from "../assets/pixel-phone.svg?raw";
import dialSvgRaw from "../assets/pixel-dial.svg?raw";

// Both files are the hand-placed pixel art, byte-for-byte — never edited,
// only their inner markup re-parented into our own <svg> so they share the
// same 64x64 coordinate space.
const stripSvgTag = (raw: string) =>
  raw.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const PHONE_INNER = stripSvgTag(phoneSvgRaw);

// pixel-dial.svg still has the old pre-made LinkedIn/GitHub/Gmail button
// shapes baked into it (black blob, blue "in" badge, white blob, plus
// their decorative border pixels) — now redundant since the real button
// caps render as their own fixed layer on top. Those specific colors are
// stripped so the dial spins as a plain disc; everything else (skin tone,
// eyebrow) stays untouched.
const OLD_BUTTON_COLORS = new Set([
  "#000000",
  "#2a3440",
  "#0d1ae6",
  "#ffffff",
  "#9999cc",
  "#3f0204",
  "#993333",
  "#cc6666",
  "#993366",
]);

const DIAL_INNER = stripSvgTag(dialSvgRaw)
  .split(/(?=<rect )/)
  .filter((rect) => {
    const m = rect.match(/fill="(#[0-9a-fA-F]{6})"/);
    return !m || !OLD_BUTTON_COLORS.has(m[1].toLowerCase());
  })
  .join("");

// Bounding box of the dial art (x:25-42, y:19-34) — its center is the
// rotation pivot, so it spins in place.
const DIAL_ORIGIN_X = 34;
const DIAL_ORIGIN_Y = 27;

type LinkTarget = "linkedin" | "github" | "email";
type Px = [number, number, string];

// Each hand-drawn button (blue = LinkedIn, black = GitHub, red/cyan =
// Gmail) shares the same source shape: a 9x7 rounded cap (rows 0-5) sat
// on a solid one-row drop shadow (row 6). Coordinates below are already
// translated onto the phone's own 64x64 grid, over the button's old slot.
// "face" = the cap, "shadow" = the row hidden/shown on press.
const BUTTON_ART: Record<LinkTarget, { face: Px[]; shadow: Px[] }> = {
  github: {
    face: [
      [31, 17, "#000000"],
      [32, 17, "#000000"],
      [33, 17, "#000000"],
      [34, 17, "#000000"],
      [35, 17, "#000000"],
      [30, 18, "#000000"],
      [31, 18, "#000000"],
      [32, 18, "#ffffff"],
      [33, 18, "#000000"],
      [34, 18, "#ffffff"],
      [35, 18, "#000000"],
      [36, 18, "#000000"],
      [29, 19, "#000000"],
      [30, 19, "#000000"],
      [31, 19, "#ffffff"],
      [32, 19, "#ffffff"],
      [33, 19, "#ffffff"],
      [34, 19, "#ffffff"],
      [35, 19, "#ffffff"],
      [36, 19, "#000000"],
      [37, 19, "#000000"],
      [29, 20, "#000000"],
      [30, 20, "#000000"],
      [31, 20, "#ffffff"],
      [32, 20, "#ffffff"],
      [33, 20, "#ffffff"],
      [34, 20, "#ffffff"],
      [35, 20, "#ffffff"],
      [36, 20, "#000000"],
      [37, 20, "#000000"],
      [29, 21, "#000000"],
      [30, 21, "#000000"],
      [31, 21, "#000000"],
      [32, 21, "#ffffff"],
      [33, 21, "#ffffff"],
      [34, 21, "#ffffff"],
      [35, 21, "#000000"],
      [36, 21, "#000000"],
      [37, 21, "#000000"],
      [30, 22, "#000000"],
      [31, 22, "#000000"],
      [32, 22, "#ffffff"],
      [33, 22, "#ffffff"],
      [34, 22, "#ffffff"],
      [35, 22, "#000000"],
      [36, 22, "#000000"],
    ],
    shadow: [
      [31, 23, "#000000"],
      [32, 23, "#000000"],
      [33, 23, "#000000"],
      [34, 23, "#000000"],
      [35, 23, "#000000"],
    ],
  },
  linkedin: {
    face: [
      [26, 21, "#ffffff"],
      [27, 21, "#0a66c2"],
      [28, 21, "#0a66c2"],
      [29, 21, "#0a66c2"],
      [30, 21, "#0a66c2"],
      [25, 22, "#0a66c2"],
      [26, 22, "#0a66c2"],
      [27, 22, "#0a66c2"],
      [28, 22, "#0a66c2"],
      [29, 22, "#0a66c2"],
      [30, 22, "#0a66c2"],
      [31, 22, "#0a66c2"],
      [24, 23, "#0a66c2"],
      [25, 23, "#0a66c2"],
      [26, 23, "#ffffff"],
      [27, 23, "#0a66c2"],
      [28, 23, "#ffffff"],
      [29, 23, "#ffffff"],
      [30, 23, "#ffffff"],
      [31, 23, "#0a66c2"],
      [32, 23, "#0a66c2"],
      [24, 24, "#0a66c2"],
      [25, 24, "#0a66c2"],
      [26, 24, "#ffffff"],
      [27, 24, "#0a66c2"],
      [28, 24, "#ffffff"],
      [29, 24, "#0a66c2"],
      [30, 24, "#ffffff"],
      [31, 24, "#0a66c2"],
      [32, 24, "#0a66c2"],
      [24, 25, "#0a66c2"],
      [25, 25, "#0a66c2"],
      [26, 25, "#ffffff"],
      [27, 25, "#0a66c2"],
      [28, 25, "#ffffff"],
      [29, 25, "#0a66c2"],
      [30, 25, "#ffffff"],
      [31, 25, "#0a66c2"],
      [32, 25, "#0a66c2"],
      [25, 26, "#0a66c2"],
      [26, 26, "#0a66c2"],
      [27, 26, "#0a66c2"],
      [28, 26, "#0a66c2"],
      [29, 26, "#0a66c2"],
      [30, 26, "#0a66c2"],
      [31, 26, "#0a66c2"],
    ],
    shadow: [
      [26, 27, "#004182"],
      [27, 27, "#004182"],
      [28, 27, "#004182"],
      [29, 27, "#004182"],
      [30, 27, "#004182"],
    ],
  },
  email: {
    face: [
      [30, 28, "#ffffff"],
      [31, 28, "#ffffff"],
      [32, 28, "#ffffff"],
      [33, 28, "#ffffff"],
      [34, 28, "#ffffff"],
      [29, 29, "#ffffff"],
      [30, 29, "#ea4335"],
      [31, 29, "#ffffff"],
      [32, 29, "#ffffff"],
      [33, 29, "#ffffff"],
      [34, 29, "#ea4335"],
      [35, 29, "#ffffff"],
      [28, 30, "#ffffff"],
      [29, 30, "#ffffff"],
      [30, 30, "#ea4335"],
      [31, 30, "#ea4335"],
      [32, 30, "#ffffff"],
      [33, 30, "#ea4335"],
      [34, 30, "#ea4335"],
      [35, 30, "#ffffff"],
      [36, 30, "#ffffff"],
      [28, 31, "#ffffff"],
      [29, 31, "#ffffff"],
      [30, 31, "#ea4335"],
      [31, 31, "#ffffff"],
      [32, 31, "#ea4335"],
      [33, 31, "#ffffff"],
      [34, 31, "#ea4335"],
      [35, 31, "#ffffff"],
      [36, 31, "#ffffff"],
      [28, 32, "#ffffff"],
      [29, 32, "#ffffff"],
      [30, 32, "#ea4335"],
      [31, 32, "#ffffff"],
      [32, 32, "#ffffff"],
      [33, 32, "#ffffff"],
      [34, 32, "#ea4335"],
      [35, 32, "#ffffff"],
      [36, 32, "#ffffff"],
      [29, 33, "#ffffff"],
      [30, 33, "#ea4335"],
      [31, 33, "#ffffff"],
      [32, 33, "#ffffff"],
      [33, 33, "#ffffff"],
      [34, 33, "#ea4335"],
      [35, 33, "#ffffff"],
    ],
    shadow: [
      [30, 34, "#dfe1e5"],
      [31, 34, "#dfe1e5"],
      [32, 34, "#dfe1e5"],
      [33, 34, "#dfe1e5"],
      [34, 34, "#dfe1e5"],
    ],
  },
};

const BUTTONS: { target: LinkTarget; label: string; cx: number; cy: number; w: number; h: number }[] =
  [
    { target: "github", label: "Open GitHub", cx: 33, cy: 20, w: 9, h: 7 },
    { target: "linkedin", label: "Open LinkedIn", cx: 28, cy: 24, w: 9, h: 7 },
    { target: "email", label: "Send an email", cx: 32, cy: 31, w: 9, h: 7 },
  ];

// Buttons never rotate — they're fixed caps sitting on top of the dial,
// scaled down a bit around their own (unmoving) center.
const BUTTON_ORIGIN: Record<LinkTarget, { x: number; y: number }> = {
  github: { x: 33, y: 20 },
  linkedin: { x: 28, y: 24 },
  email: { x: 32, y: 31 },
};
const BUTTON_SCALE = 0.7;

// The dial art sits on top of the original phone art's own (smaller,
// crude) blob pixels at these same coordinates. Since the dial rotates,
// those original pixels need hiding — otherwise they'd stay put and
// "ghost" behind it once it spins away. Patched to the same skin tone
// used elsewhere on the face rather than cut out, so there's no
// hard-edged hole. (The buttons themselves never move, so nothing needs
// patching under them — they always cover the same spot.)
const PATCH_FILL = "#a04269";
const DIAL_CELLS: [number, number][] = (() => {
  const cells: [number, number][] = [];
  const re = /<rect x="(\d+)" y="(\d+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(dialSvgRaw))) cells.push([+m[1], +m[2]]);
  return cells;
})();

function patchBaseArt(inner: string): string {
  let out = inner;
  for (const [x, y] of DIAL_CELLS) {
    const re = new RegExp(
      `<rect x="${x}" y="${y}" width="1" height="1" fill="#[0-9a-fA-F]{6}"`,
    );
    out = out.replace(re, `<rect x="${x}" y="${y}" width="1" height="1" fill="${PATCH_FILL}"`);
  }
  return out;
}

const PATCHED_PHONE_INNER = patchBaseArt(PHONE_INNER);

const SPIN_DEG = 300;
const PRESS_MS = 130;
const RELEASE_MS = 130;

function playRing() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    // Old-phone ring: two alternating tones, on/off/on/off.
    const beep = (start: number, freq: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.15, now + start + 0.02);
      gain.gain.setValueAtTime(0.15, now + start + dur - 0.02);
      gain.gain.linearRampToValueAtTime(0, now + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur);
    };
    beep(0, 950, 0.3);
    beep(0.35, 1200, 0.3);
    setTimeout(() => ctx.close(), 900);
  } catch {
    // Audio isn't available in every environment — the visual dial still works.
  }
}

export function PixelPhone() {
  const { email, github, linkedin } = CONTENT.links;
  const reducedMotion = usePrefersReducedMotion();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pressed, setPressed] = useState<LinkTarget | null>(null);
  const phaseRef = useRef<"idle" | "forward" | "returning">("idle");
  const pendingRef = useRef<LinkTarget | null>(null);

  const navigate = (target: LinkTarget) => {
    if (target === "email") {
      const a = document.createElement("a");
      a.href = `mailto:${email}`;
      a.click();
    } else {
      window.open(target === "github" ? github : linkedin, "_blank", "noopener,noreferrer");
    }
  };

  const startSpin = (target: LinkTarget) => {
    if (reducedMotion) {
      navigate(target);
      return;
    }
    pendingRef.current = target;
    setSpinning(true);
    phaseRef.current = "forward";
    setRotation(SPIN_DEG);
  };

  const handleTransitionEnd = (e: TransitionEvent<SVGGElement>) => {
    if (e.target !== e.currentTarget) return; // ignore bubbled button press/release transitions
    if (phaseRef.current === "forward") {
      navigate(pendingRef.current ?? "email");
      phaseRef.current = "returning";
      setRotation(0);
    } else if (phaseRef.current === "returning") {
      phaseRef.current = "idle";
      setSpinning(false);
    }
  };

  const handleClick = (target: LinkTarget) => {
    if (spinning || pressed) return;
    playRing();
    // Press: hide the drop-shadow row, drop the cap 1px into its place.
    // The button itself never rotates — only the dial underneath does.
    setPressed(target);
    setTimeout(() => {
      // Release: shadow and cap both back to rest.
      setPressed(null);
      setTimeout(() => startSpin(target), RELEASE_MS);
    }, PRESS_MS);
  };

  return (
    <div className="pixel-phone-wrap">
      <svg viewBox="0 0 64 64" shapeRendering="crispEdges" className="pixel-phone-svg" aria-hidden="true">
        {/* Fixed base — the original phone art, patched only where the
            dial sits so nothing ghosts behind it once it spins. */}
        <g dangerouslySetInnerHTML={{ __html: PATCHED_PHONE_INNER }} />

        {/* The dial — a separate piece of art (pixel-dial.svg), placed on
            top at its native coordinates. This is the only thing that
            ever rotates. */}
        <g
          className="pixel-phone-dial"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${DIAL_ORIGIN_X}px ${DIAL_ORIGIN_Y}px`,
          }}
          onTransitionEnd={handleTransitionEnd}
          dangerouslySetInnerHTML={{ __html: DIAL_INNER }}
        />
      </svg>

      <svg viewBox="0 0 64 64" shapeRendering="crispEdges" className="pixel-phone-btn-layer" aria-hidden="true">
        {(Object.keys(BUTTON_ART) as LinkTarget[]).map((target) => {
          const art = BUTTON_ART[target];
          const origin = BUTTON_ORIGIN[target];
          const isPressed = pressed === target;
          return (
            <g
              key={target}
              style={{
                transform: `scale(${BUTTON_SCALE})`,
                transformOrigin: `${origin.x}px ${origin.y}px`,
              }}
            >
              <g className="pixel-phone-btn-shadow" style={{ opacity: isPressed ? 0 : 1 }}>
                {art.shadow.map(([x, y, fill], i) => (
                  <rect key={i} x={x} y={y} width={1} height={1} fill={fill} />
                ))}
              </g>
              <g
                className="pixel-phone-btn-face"
                style={{ transform: isPressed ? "translateY(1px)" : "translateY(0)" }}
              >
                {art.face.map(([x, y, fill], i) => (
                  <rect key={i} x={x} y={y} width={1} height={1} fill={fill} />
                ))}
              </g>
            </g>
          );
        })}
      </svg>
      <div className="pixel-phone-hitzones">
        {BUTTONS.map((b) => (
          <button
            key={b.target}
            type="button"
            className="pixel-phone-hit"
            aria-label={b.label}
            disabled={spinning || pressed !== null}
            style={{
              left: `${(b.cx / 64) * 100}%`,
              top: `${(b.cy / 64) * 100}%`,
              width: `${(b.w * BUTTON_SCALE / 64) * 100}%`,
              height: `${(b.h * BUTTON_SCALE / 64) * 100}%`,
            }}
            onClick={() => handleClick(b.target)}
          />
        ))}
      </div>
    </div>
  );
}
