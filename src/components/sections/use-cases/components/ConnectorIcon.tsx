"use client";

import Image from "next/image";

/**
 * Tool/connector glyphs are brand-coloured SVGs that we flatten to a single
 * tone for consistent visual rhythm. Dark themes flatten to white
 * (`brightness(0) invert(1)`); light themes flatten to black
 * (`brightness(0)` alone). The `.connector-icon` class — defined in
 * tokens.css — swaps the filter based on `data-theme`, since Tailwind's
 * arbitrary-filter variant doesn't cascade cleanly when two filters
 * overlap across the dark: boundary.
 */
export default function ConnectorIcon({ src, size = 20 }: { src: string; size?: number }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className="connector-icon object-contain"
    />
  );
}
