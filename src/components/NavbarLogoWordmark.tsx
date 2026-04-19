"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * Variant B: "Logotype" — SVG-rendered stylized wordmark with small icon accent.
 * Animated scan line + spring-bounce icon.
 */

const letterVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" as const },
  }),
};

const WORD = "PERSONAS";

export default function NavbarLogoWordmark({ scrolled }: { scrolled?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5 focus-ring">
      {/* Small icon accent */}
      <motion.div
        className="relative flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] border border-glass"
        whileHover={{ rotate: 12, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Image
          src="/imgs/logo.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain drop-shadow-[0_0_6px_rgba(6,182,212,0.3)]"
          priority
        />
      </motion.div>

      {/* SVG-style wordmark */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex items-baseline gap-[1px]"
          initial="hidden"
          animate="visible"
        >
          {WORD.split("").map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              className="text-[15px] font-extrabold tracking-[0.18em] leading-none"
              style={{
                background: `linear-gradient(135deg, #06b6d4 ${i * 12}%, #a855f7 ${50 + i * 6}%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: scrolled
                  ? "brightness(0.7)"
                  : "brightness(1) drop-shadow(0 0 4px rgba(6,182,212,0.15))",
                transition: "filter 0.3s",
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Animated scan line */}
        <motion.div
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-brand-cyan/15 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
        />

        {/* Bottom line */}
        <div className="mt-0.5 h-[1px] w-full bg-gradient-to-r from-brand-cyan/40 via-brand-purple/20 to-transparent" />
      </div>
    </Link>
  );
}
