"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { PLATE } from "./geometry";

/**
 * One layer of the exploded view: a slab (top face plus a darker side, so it
 * reads as a thick plate) that floats at height `z`. Only its transform
 * animates - opacity on a preserve-3d parent would flatten what stands on it.
 */
export default function Plate({
  z,
  tone,
  still,
  delay,
  children,
}: {
  z: number;
  tone: string;
  still: boolean;
  delay: number;
  children?: ReactNode;
}) {
  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ width: PLATE, height: PLATE, transformStyle: "preserve-3d" }}
      initial={false}
      animate={{ z }}
      transition={still ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 14, delay }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[34px]"
        style={{ transform: "translateZ(-12px)", background: `color-mix(in srgb, ${tone} 16%, transparent)`, boxShadow: `0 0 0 1px color-mix(in srgb, ${tone} 30%, transparent)` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[34px] border"
        style={{
          borderColor: `color-mix(in srgb, ${tone} 55%, transparent)`,
          boxShadow: `inset 0 0 40px color-mix(in srgb, ${tone} 14%, transparent), 0 0 60px color-mix(in srgb, ${tone} 12%, transparent)`,
          backgroundImage: `linear-gradient(color-mix(in srgb, ${tone} 12%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, ${tone} 12%, transparent) 1px, transparent 1px), radial-gradient(circle at 30% 25%, color-mix(in srgb, ${tone} 22%, transparent), color-mix(in srgb, ${tone} 6%, transparent) 70%)`,
          backgroundSize: "32px 32px, 32px 32px, 100% 100%",
        }}
      />
      {children}
    </motion.div>
  );
}
