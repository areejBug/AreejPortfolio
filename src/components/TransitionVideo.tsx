import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../lib/useMediaQuery";

// transition.mp4 (18s total) has two distinct uses: a 0–7s segment looped
// behind the splash screen while waiting for Enter, and an 8–10s segment
// played once — as the boot transition, replacing the old canvas binary-
// rain animation — when Enter is pressed.
const LOOP_START = 0;
const LOOP_END = 7;
const ONCE_START = 8;
const ONCE_END = 10;

type TransitionVideoProps =
  | { mode: "loop" }
  | { mode: "once"; onEnded: (skipped: boolean) => void };

export function TransitionVideo(props: TransitionVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const onEndedRef = useRef<((skipped: boolean) => void) | undefined>(
    props.mode === "once" ? props.onEnded : undefined,
  );
  const firedRef = useRef(false);

  useEffect(() => {
    onEndedRef.current = props.mode === "once" ? props.onEnded : undefined;
  });

  useEffect(() => {
    firedRef.current = false;
    const v = ref.current;
    if (reducedMotion) {
      // No animated boot transition under reduced motion — jump straight
      // through, same as the old binary-rain intro's reduced-motion path.
      if (props.mode === "once" && !firedRef.current) {
        firedRef.current = true;
        onEndedRef.current?.(true);
      }
      return;
    }
    if (!v) return;
    v.currentTime = props.mode === "loop" ? LOOP_START : ONCE_START;
    v.play().catch(() => {});
  }, [props.mode, reducedMotion]);

  return (
    <video
      ref={ref}
      className="transition-video"
      aria-hidden="true"
      src="/videos/transition.mp4"
      muted
      playsInline
      onTimeUpdate={(e) => {
        if (reducedMotion) return;
        const v = e.currentTarget;
        if (props.mode === "loop" && v.currentTime >= LOOP_END) {
          v.currentTime = LOOP_START;
        } else if (props.mode === "once" && v.currentTime >= ONCE_END && !firedRef.current) {
          firedRef.current = true;
          onEndedRef.current?.(false);
        }
      }}
    />
  );
}
