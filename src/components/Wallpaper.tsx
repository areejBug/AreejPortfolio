import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../lib/useMediaQuery";

// Single continuous 0–2s loop — used behind the desktop and the "Hi, I am
// ..." hero screen alike, so both show the exact same looping wallpaper
// rather than switching between different segments of the clip.
const LOOP_END_S = 2;

export function Wallpaper() {
  const ref = useRef<HTMLVideoElement>(null);
  // An auto-playing background video isn't caught by the site-wide
  // prefers-reduced-motion CSS rule (that only shortens animations/
  // transitions), so it's handled explicitly here: pause on a single still
  // frame instead of looping.
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    if (reducedMotion) v.pause();
    else v.play().catch(() => {});
  }, [reducedMotion]);

  return (
    <>
      <video
        ref={ref}
        className="wallpaper"
        aria-hidden="true"
        src="/videos/livewallpaper.mp4"
        autoPlay={!reducedMotion}
        muted
        loop={false}
        playsInline
        onTimeUpdate={(e) => {
          if (reducedMotion) return;
          const v = e.currentTarget;
          if (v.currentTime >= LOOP_END_S) v.currentTime = 0;
        }}
      />
      {/* A themed semi-transparent scrim over the video, not raw opacity on
          the video itself — opacity alone would reveal the plain white page
          background behind it instead of dimming toward a theme colour. */}
      <div className="wallpaper-scrim" aria-hidden="true" />
    </>
  );
}
