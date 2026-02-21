"use client";

import { motion } from "framer-motion";

export default function CinematicBreather() {
  return (
    <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4">
      {/* Full-bleed animated gradient */}
      <div className="absolute inset-0 cinematic-gradient" />

      {/* Noise overlay */}
      <div className="noise absolute inset-0" />

      {/* Edge fades into surrounding sections */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Decorative side lines */}
      <div className="pointer-events-none absolute left-[10%] top-1/2 hidden h-px w-24 -translate-y-1/2 bg-gradient-to-r from-transparent to-brand-cyan/15 lg:block" />
      <div className="pointer-events-none absolute right-[10%] top-1/2 hidden h-px w-24 -translate-y-1/2 bg-gradient-to-l from-transparent to-brand-purple/15 lg:block" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 text-center"
      >
        <h2 className="text-4xl font-black leading-[1.15] tracking-tight sm:text-6xl md:text-8xl lg:text-[7rem] drop-shadow-2xl">
          <span className="block text-white drop-shadow-md">Your agents.</span>
          <span className="block mt-3 bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple bg-clip-text text-transparent drop-shadow-lg">
            Your rules.
          </span>
          <span className="block mt-3 text-white/30 font-light tracking-wide">Your infrastructure.</span>
        </h2>
      </motion.div>
    </section>
  );
}
