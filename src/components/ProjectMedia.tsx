import { useRef, useState } from "react";
import type { Project } from "../types";
import { PixelThumb } from "./PixelThumb";

type ProjectMediaProps = {
  project: Project;
  width: number;
  height: number;
  /** Extra class on the outer .media-frame — sizing/chrome only (border,
   * shadow, max-width). Never use this to override aspect-ratio or
   * object-fit; those live in the single shared .media-frame rule. */
  frameClassName?: string;
  /**
   * "thumb" = small rail/card preview: muted, looping, no pause control, reads
   * like a live GIF. "hero" = the project window's banner: same autoplay
   * loop, plus a themed pause button below the frame (native controls stay
   * off so it doesn't clash with the pixel-OS chrome).
   */
  variant?: "thumb" | "hero";
};

/**
 * Whatever real media a project has, shown in priority order: a running
 * demo video first, then a screenshot, then the procedural pixel-art
 * placeholder. This is the one place that priority is decided, so every
 * consumer (project window header, featured-rail hover preview, gallery
 * grid) never disagrees, and all three always render inside the exact same
 * .media-frame shape — real media and the placeholder alike.
 */
export function ProjectMedia({
  project,
  width,
  height,
  frameClassName,
  variant = "thumb",
}: ProjectMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const frameClass = `media-frame${frameClassName ? ` ${frameClassName}` : ""}`;

  if (project.video) {
    const isHero = variant === "hero";

    function togglePlay() {
      const v = videoRef.current;
      if (!v) return;
      if (v.paused) {
        v.play();
        setPlaying(true);
      } else {
        v.pause();
        setPlaying(false);
      }
    }

    // Fullscreens only the <video> element itself (native Fullscreen API),
    // not the OS window it sits in — "enlarge the video screen ONLY".
    function enlarge() {
      videoRef.current?.requestFullscreen?.();
    }

    return (
      <>
        <div className={frameClass}>
          <video
            ref={videoRef}
            src={project.video}
            autoPlay
            muted
            loop
            playsInline
            aria-label={isHero ? `${project.name} demo video` : undefined}
            aria-hidden={isHero ? undefined : "true"}
          />
        </div>
        {isHero && (
          <div className="media-btn-row">
            <button type="button" className="media-pause-btn" onClick={togglePlay}>
              {playing ? "❚❚ Need a pause?" : "▶ Okay, back to it"}
            </button>
            <button type="button" className="media-pause-btn" onClick={enlarge}>
              ⛶ Enlarge
            </button>
          </div>
        )}
      </>
    );
  }

  if (project.shots && project.shots[0]) {
    return (
      <div className={frameClass}>
        <img
          src={project.shots[0]}
          alt={variant === "hero" ? `${project.name} screenshot` : ""}
        />
      </div>
    );
  }

  return (
    <div className={frameClass}>
      <PixelThumb project={project} width={width} height={height} />
    </div>
  );
}
