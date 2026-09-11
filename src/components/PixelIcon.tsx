import { useEffect, useRef } from "react";
import { drawIcon, type IconKind } from "../lib/pixel";
import { useStore } from "../store";

type PixelIconProps = {
  kind: IconKind;
  size?: number;
};

/** Canvas-rendered pixel icon. Redraws automatically when the theme changes. */
export function PixelIcon({ kind, size = 38 }: PixelIconProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    if (ref.current) drawIcon(ref.current, kind);
  }, [kind, theme]);

  return <canvas ref={ref} width={size} height={size} aria-hidden="true" />;
}
