"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface ImageBackgroundProps {
  src: string;
  alt: string;
  /** Dark overlay opacity, e.g. "bg-black/65". Defaults to "bg-black/65". */
  overlayClass?: string;
  /** Enable parallax scrolling on the image. Defaults to false. */
  parallax?: boolean;
  /** Blur data URL placeholder for next/image. */
  blurDataURL?: string;
}

export default function ImageBackground({
  src,
  alt,
  overlayClass = "bg-black/65",
  parallax = false,
  blurDataURL,
}: ImageBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const imageElement = (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover object-center"
      sizes="100vw"
      quality={80}
      loading="lazy"
      placeholder={blurDataURL ? "blur" : undefined}
      blurDataURL={blurDataURL}
    />
  );

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {parallax ? (
        <motion.div style={{ y }} className="absolute inset-0 h-[120%] -top-[10%]">
          {imageElement}
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-black">
          {imageElement}
        </div>
      )}
      <div className={`absolute inset-0 ${overlayClass}`} />
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 bg-linear-to-r from-background/40 via-transparent to-background/40" />
    </div>
  );
}
