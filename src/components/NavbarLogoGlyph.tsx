"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * Variant A: "Glyph Mark" — Icon-forward logo with animated neon pulse.
 * Large icon dominates; gradient text collapses to monogram on scroll.
 */
export default function NavbarLogoGlyph({ scrolled }: { scrolled?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3 focus-ring">
      {/* Animated glow ring behind the icon */}
      <div className="relative flex h-10 w-10 items-center justify-center">
        {/* Outer pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-xl border border-brand-cyan/30"
          animate={{
            boxShadow: [
              "0 0 8px rgba(6,182,212,0.15), inset 0 0 6px rgba(168,85,247,0.1)",
              "0 0 16px rgba(6,182,212,0.3), inset 0 0 10px rgba(168,85,247,0.2)",
              "0 0 8px rgba(6,182,212,0.15), inset 0 0 6px rgba(168,85,247,0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
