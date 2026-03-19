"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

/**
 * Parallax cinematic background image with dark overlay + edge fades.
 * Drop this inside a `relative overflow-hidden` container.
 */
export default function CinematicBg({
  src,
  alt,
  opacity = 65,
}: {
  src: string;
  alt: string;
  /** Dark overlay opacity 0-100, default 65 */
  opacity?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <motion.div style={{ y }} className="absolute inset-0 h-[116%] -top-[8%]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="100vw"
          quality={80}
        />
      </motion.div>
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${opacity / 100})` }} />
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 bg-linear-to-r from-background/50 via-transparent to-background/50" />
    </div>
  );
}
