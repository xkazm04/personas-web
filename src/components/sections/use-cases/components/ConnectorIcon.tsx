"use client";

import Image from "next/image";

/**
 * Tool/connector glyphs are black-only SVGs. In dark themes we force them
 * to white via `brightness(0) invert(1)`; in light themes we drop the
 * invert so they render as foreground-black with a soft shadow.
 */
export default function ConnectorIcon({ src, size = 20 }: { src: string; size?: number }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className="object-contain [filter:brightness(0)_drop-shadow(0_0_2px_rgba(0,0,0,0.25))] dark:[filter:brightness(0)_invert(1)_drop-shadow(0_0_2px_rgba(255,255,255,0.4))]"
    />
  );
}
