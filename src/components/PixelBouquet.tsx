import { useEffect, useRef } from "react";
import { bouquetLeafSpots, drawBouquet } from "../lib/pixel";
import { useStore } from "../store";

type PixelBouquetProps = {
  width?: number;
  height?: number;
};

// The coordinate space drawBouquet/bouquetLeafSpots computes in.
const BOUQUET_W = 36;
const BOUQUET_H = 26;
const LEAF_SIZE = 12;

/** The one dense bouquet accent, sitting directly below ROOT — curling
 * stems drawn on canvas, each tipped with a real leaf image. */
export function PixelBouquet({ width = 46, height = 33 }: PixelBouquetProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    if (ref.current) drawBouquet(ref.current);
  }, [theme]);

  const scaleX = width / BOUQUET_W;
  const scaleY = height / BOUQUET_H;

  return (
    <span
      className="pixel-bouquet"
      style={{ width, height }}
      aria-hidden="true"
    >
      <canvas ref={ref} width={width} height={height} />
      {bouquetLeafSpots().map((spot, i) => (
        <img
          key={i}
          className="bouquet-leaf"
          src="/images/leaf.jpg"
          alt=""
          style={{
            left: spot.x * scaleX,
            top: spot.y * scaleY,
            width: LEAF_SIZE,
            height: LEAF_SIZE,
          }}
        />
      ))}
    </span>
  );
}
