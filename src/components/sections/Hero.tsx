"use client";

import { motion } from "framer-motion";
import { Download, Github, ChevronDown } from "lucide-react";
import GradientText from "@/components/GradientText";
import FloatingParticles from "@/components/FloatingParticles";
import { fadeUp, staggerContainer } from "@/lib/animations";

/* Decorative geometric shapes — pre-computed to avoid random in render */
const shapes = [
  { type: "ring", x: "12%", y: "20%", size: 60, delay: 0, duration: 22 },
  { type: "ring", x: "82%", y: "25%", size: 40, delay: 4, duration: 28 },
  { type: "hex", x: "90%", y: "65%", size: 24, delay: 2, duration: 18 },
  { type: "hex", x: "6%", y: "70%", size: 18, delay: 6, duration: 25 },
  { type: "dot", x: "20%", y: "80%", size: 6, delay: 1, duration: 14 },
  { type: "dot", x: "75%", y: "15%", size: 8, delay: 3, duration: 16 },
];

function DecorativeShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map((s, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: s.x,
            top: s.y,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          {s.type === "ring" && (
            <div
              className="rounded-full border border-white/[0.04]"
              style={{ width: s.size, height: s.size }}
            />
          )}
          {s.type === "hex" && (
            <svg width={s.size} height={s.size} viewBox="0 0 24 24" className="text-white/[0.03]">
              <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
          {s.type === "dot" && (
            <div
              className="rounded-full bg-brand-cyan/10"
              style={{ width: s.size, height: s.size }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="noise relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* ── Background layers ─────────────────────── */}

      {/* Primary orb — purple, top-left */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-pulse-slow absolute left-[15%] top-[15%] h-[600px] w-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, rgba(168,85,247,0.04) 40%, transparent 70%)" }}
        />
        {/* Secondary orb — cyan, bottom-right */}
        <div
          className="animate-pulse-slower absolute bottom-[15%] right-[10%] h-[700px] w-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)" }}
        />
        {/* Tertiary orb — blue, center */}
        <div
          className="animate-pulse-slow absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 60%)", animationDelay: "5s" }}
        />
      </div>

      {/* Dot grid */}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Geometric decorations */}
      <DecorativeShapes />

      {/* Orbital ring — large, slow-spinning */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-spin-slow" style={{ width: 600, height: 600 }}>
          <svg viewBox="0 0 600 600" className="h-full w-full">
            <circle cx="300" cy="300" r="280" fill="none" stroke="rgba(6,182,212,0.03)" strokeWidth="0.5" strokeDasharray="4 12" />
            <circle cx="300" cy="300" r="200" fill="none" stroke="rgba(168,85,247,0.025)" strokeWidth="0.5" strokeDasharray="3 15" />
            {/* Small orbiting dot */}
            <circle cx="300" cy="20" r="2" fill="rgba(6,182,212,0.15)" />
          </svg>
        </div>
      </div>

      {/* Vignette edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 50%, rgba(10,10,18,0.6) 100%)" }}
      />

      {/* ── Content ───────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        {/* Badge with shimmer */}
        <motion.div variants={fadeUp}>
          <span className="relative inline-flex items-center overflow-hidden rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-brand-cyan font-mono">
            <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent" style={{ animationDuration: "3s" }} />
            <span className="relative">AI Agent Platform</span>
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-[5.2rem]"
        >
          <span className="block">Build intelligent agents</span>
          <GradientText className="block mt-1">that work for you</GradientText>
        </motion.h1>

        {/* Decorative line under heading */}
        <motion.div variants={fadeUp} className="mx-auto mt-6 h-px w-32 bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent" />

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl"
        >
          Design agents in natural language. Orchestrate them locally or in the
          cloud. No workflow diagrams. No code.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Primary — with gradient border wrapper */}
          <div className="relative rounded-full p-px bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple animate-border-flow">
            <a
              href="#download"
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-brand-cyan px-8 py-4 text-sm font-semibold text-black transition-all duration-300 hover:brightness-110"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Download className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="relative">Download for Windows</span>
            </a>
          </div>
          {/* Secondary */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-full border border-white/[0.08] px-8 py-4 text-sm font-medium text-muted transition-all duration-300 hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.02]"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </motion.div>

        {/* Trust line */}
        <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-dark">
          <span>Free forever</span>
          <span className="h-3 w-px bg-white/[0.06]" />
          <span>No account required</span>
          <span className="h-3 w-px bg-white/[0.06]" />
          <span>12 MB installer</span>
        </motion.div>
      </motion.div>

      {/* ── Bottom ────────────────────────────────── */}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-[10px] tracking-widest uppercase text-muted-dark">Scroll</span>
          <ChevronDown className="h-4 w-4 text-muted-dark animate-scroll-hint" />
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </section>
  );
}
