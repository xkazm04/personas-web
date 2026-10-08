"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { tint } from "@/lib/brand-theme";

/**
 * Variant A: "Glyph Mark" — Icon-forward logo with animated neon pulse.
 * Large icon dominates; gradient text collapses to monogram on scroll.
 */
export default function NavbarLogoGlyph({ scrolled }: { scrolled?: boolean }) {
  // The pulse lives in the navbar on every page - the one piece of motion a
  // visitor can never scroll away from. It used to be a framer loop animating
  // box-shadow: a JS tick plus a repaint on every frame for the life of the
  // page. It is now a CSS opacity crossfade between two static shadows
  // (compositor-only), which the global reduced-motion reset and the hidden-tab
  // pause in globals.css both reach. Under reduced motion it holds the resting
  // shadow.
  return (
    <Link href="/" className="group flex items-center gap-3 focus-ring">
      {/* Animated glow ring behind the icon */}
      <div className="relative flex h-10 w-10 items-center justify-center">
        {/* Outer ring at rest, and the peak glow fading in and out over it */}
        <div
          className="absolute inset-0 rounded-xl border border-brand-cyan/30"
          style={{ boxShadow: `0 0 8px ${tint("cyan", 15)}, inset 0 0 6px ${tint("purple", 10)}` }}
        />
        <div
          aria-hidden
          className="absolute inset-0 rounded-xl opacity-0 animate-glow-crossfade"
          style={{ boxShadow: `0 0 16px ${tint("cyan", 30)}, inset 0 0 10px ${tint("purple", 20)}` }}
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
