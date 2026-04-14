"use client";

import Image from "next/image";

export default function ConnectorIcon({ src, size = 20 }: { src: string; size?: number }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_0_1px_rgba(255,255,255,0.8)] [filter:brightness(0)_invert(1)_drop-shadow(0_0_2px_rgba(255,255,255,0.4))]"
    />
  );
}
