import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CONTENT } from "../content";
import { unlockAudio, sClick } from "../lib/audio";
import { usePrefersReducedMotion } from "../lib/useMediaQuery";
import { TransitionVideo } from "./TransitionVideo";

type SplashProps = {
  onEnter: () => void;
};

const BOOT_STEPS = ["memory check", "cpu check", "assets load", "user auth"];
const DOT_COUNT = 6;

// Faint drifting dots for ambient depth — not decoration with meaning, just atmosphere.
const PARTICLES = [
  { top: "18%", left: "10%", size: 5, duration: 9, delay: 0 },
  { top: "70%", left: "8%", size: 4, duration: 11, delay: 1.5 },
  { top: "24%", left: "90%", size: 6, duration: 10, delay: 0.6 },
  { top: "78%", left: "92%", size: 4, duration: 8.5, delay: 2.2 },
  { top: "46%", left: "95%", size: 3, duration: 12, delay: 0.9 },
  { top: "52%", left: "4%", size: 3, duration: 10.5, delay: 3 },
];

function formatClock12(d: Date) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

export function Splash({ onEnter }: SplashProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [clock, setClock] = useState(() => formatClock12(new Date()));
  const [revealed, setRevealed] = useState(reducedMotion ? BOOT_STEPS.length : 0);
  const [done, setDone] = useState(reducedMotion);
  const [typedTagline, setTypedTagline] = useState(
    reducedMotion ? CONTENT.tagline : "",
  );
  const gateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setClock(formatClock12(new Date())), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    if (revealed >= BOOT_STEPS.length) {
      const t = setTimeout(() => setDone(true), 260);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealed((n) => n + 1), 260);
    return () => clearTimeout(t);
  }, [revealed, reducedMotion]);

  // Tagline types itself out, same cadence as the post-intro hero screen.
  useEffect(() => {
    if (reducedMotion) return;
    let i = 0;
    let timer = 0;
    function type() {
      if (i < CONTENT.tagline.length) {
        i++;
        setTypedTagline(CONTENT.tagline.slice(0, i));
        timer = window.setTimeout(type, 26);
      }
    }
    timer = window.setTimeout(type, 300);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  // Cursor-following glow — purely cosmetic, skipped under reduced motion.
  useEffect(() => {
    if (reducedMotion) return;
    const el = gateRef.current;
    if (!el) return;
    let raf = 0;
    function onMove(e: MouseEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const mx = (e.clientX / window.innerWidth) * 100;
        const my = (e.clientY / window.innerHeight) * 100;
        el!.style.setProperty("--mx", `${mx}%`);
        el!.style.setProperty("--my", `${my}%`);
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  function enter() {
    unlockAudio();
    sClick();
    onEnter();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") enter();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeDot = Math.min(revealed + (done ? 1 : 0), DOT_COUNT - 1);

  return (
    <div className="gate" ref={gateRef} style={{ "--mx": "50%", "--my": "45%" } as CSSProperties}>
      {!reducedMotion && <TransitionVideo mode="loop" />}
      <div className="gate-video-scrim" aria-hidden="true" />
      {!reducedMotion &&
        PARTICLES.map((p, i) => (
          <span
            key={i}
            className="gate-particle"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
            aria-hidden="true"
          />
        ))}

      <div className="gate-topbar">
        <span>areej_OS v2.1.7</span>
        <span className="gate-welcome">✦ welcome, traveler. ✦</span>
        <span className="gate-clock" aria-label="Current time">
          {clock}
        </span>
      </div>

      <div className="gate-box">
        <div className="gate-glow" aria-hidden="true" />
        <div className="gate-hero-wrap">
          <h2>{CONTENT.name}</h2>
        </div>

        <p className="gate-who">
          {reducedMotion ? CONTENT.tagline : typedTagline}
          {!reducedMotion && <span className="gate-cur" />}
        </p>

        <button id="gate-btn" type="button" onClick={enter}>
          ▶&nbsp;ENTER PORTFOLIO
        </button>

        <div className="gate-hint">
          Press <kbd>ENTER</kbd> to continue
        </div>

        <div className="gate-dots" aria-hidden="true">
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <span key={i} className={i === activeDot ? "on" : ""} />
          ))}
        </div>
      </div>

      <div className="gate-syslog" aria-hidden="true">
        <div className="head">
          <span>&gt; system.log</span>
          <span>•••</span>
        </div>
        <div className="label">boot sequence:</div>
        {BOOT_STEPS.slice(0, revealed).map((step) => (
          <div className="row" key={step}>
            <span>&gt; {step}</span>
            <span className="ok">[ OK ]</span>
          </div>
        ))}
        {done && <div className="done">system initialized successfully.</div>}
      </div>

      <div className="gate-credits">
        <span>
          © {new Date().getFullYear()} {CONTENT.name}
        </span>
        <span>crafted with &lt;html&gt; &lt;css&gt; &lt;js&gt;</span>
      </div>
    </div>
  );
}
