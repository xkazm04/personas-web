"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { useStillMotion } from "@/hooks/useStillMotion";
import { tint } from "@/lib/brand-theme";

/**
 * Variant A: "Glyph Mark" — Icon-forward logo with animated neon pulse.
 * Large icon dominates; gradient text collapses to monogram on scroll.
 */
export default function NavbarLogoGlyph({ scrolled }: { scrolled?: boolean }) {
  // The pulse below is a `repeat: Infinity` loop mounted in the navbar on
  // every page, so it is the one piece of motion a visitor can never scroll
  // away from. It is framer-driven, which means the global reduced-motion
  // reset in globals.css cannot reach it — that rule governs CSS animation,
  // and this writes inline styles. An infinite loop reduces to stillness, not
  // to a faster loop, so the gate drops the keyframes entirely.
  const reduced = useStillMotion();

  return (
    <Link href="/" className="group flex items-center gap-3 focus-ring">
      {/* Animated glow ring behind the icon */}
      <div className="relative flex h-10 w-10 items-center justify-center">
        {/* Outer pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-xl border border-brand-cyan/30"
          animate={
            reduced
              ? // Stillness: hold the resting end of the pulse.
                {
                  boxShadow: `0 0 8px ${tint("cyan", 15)}, inset 0 0 6px ${tint("purple", 10)}`,
                }
              : {
                  // Brand tokens rather than the cyan/purple hexes they used to be
                  // hardcoded as: `tint()` emits color-mix(), which framer-motion
                  // could not interpolate before 12.37, so the pulse had to be
                  // literal rgba and stayed cyan/purple under every theme variant.
                  boxShadow: [
                    `0 0 8px ${tint("cyan", 15)}, inset 0 0 6px ${tint("purple", 10)}`,
                    `0 0 16px ${tint("cyan", 30)}, inset 0 0 10px ${tint("purple", 20)}`,
                    `0 0 8px ${tint("cyan", 15)}, inset 0 0 6px ${tint("purple", 10)}`,
                  ],
                }
          }
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        />
        {/* Icon */}
        <Image
          src="/imgs/logo.png"
          alt="Personas"
          width={36}
          height={36}
          className="relative h-9 w-9 rounded-lg object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]
                     transition-transform duration-300 group-hover:scale-110"
          priority
        />
      </div>

      {/* Text: collapses to monogram on scroll */}
      <div className="relative overflow-hidden">
        <motion.span
          className="block text-lg font-bold tracking-tight bg-gradient-to-r from-brand-cyan via-foreground to-brand-purple bg-clip-text text-transparent"
          animate={{ opacity: scrolled ? 0.7 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {scrolled ? "P" : "Personas"}
        </motion.span>
        {/* Underline accent */}
        <motion.div
          className="absolute -bottom-0.5 left-0 h-[1.5px] bg-gradient-to-r from-brand-cyan to-brand-purple"
          initial={{ width: 0 }}
          animate={{ width: scrolled ? 12 : "100%" }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
      </div>
    </Link>
  );
}
