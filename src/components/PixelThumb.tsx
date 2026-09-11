import { useEffect, useRef } from "react";
import { drawThumb } from "../lib/pixel";
import type { Project } from "../types";
import { useStore } from "../store";

type PixelThumbProps = {
  project: Project;
  width: number;
  height: number;
  className?: string;
};

/** Deterministic procedural project thumbnail. Redraws automatically on theme change. */
export function PixelThumb({ project, width, height, className }: PixelThumbProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    if (ref.current) drawThumb(ref.current, project, width, height);
  }, [project, width, height, theme]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
    />
  );
}
