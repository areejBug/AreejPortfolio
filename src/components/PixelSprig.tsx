type PixelSprigProps = {
  size?: number;
};

/** The small leaf-sprig accent placed at every branch junction in the
 * project tree — a short CSS stem with 3 real leaf images. */
export function PixelSprig({ size = 14 }: PixelSprigProps) {
  return (
    <span className="pixel-sprig" style={{ width: size, height: size }} aria-hidden="true">
      <span className="sprig-stem" />
      <img className="sprig-leaf a" src="/images/leaf.jpg" alt="" />
      <img className="sprig-leaf b" src="/images/leaf.jpg" alt="" />
      <img className="sprig-leaf c" src="/images/leaf.jpg" alt="" />
    </span>
  );
}
