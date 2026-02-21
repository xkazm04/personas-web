"use client";

import { motion } from "framer-motion";
import { Download, Monitor, Apple, Terminal } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import GradientText from "@/components/GradientText";

const platforms = [
  { icon: Monitor, label: "Windows", available: true },
  { icon: Apple, label: "macOS", available: false },
  { icon: Terminal, label: "Linux", available: false },
];

export default function DownloadCTA() {
  return (
    <section id="download" className="noise relative px-4 sm:px-6 py-28 md:py-44">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="animate-pulse-slow h-[600px] w-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(168,85,247,0.06) 30%, transparent 65%)",
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="animate-pulse-slower h-[400px] w-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Decorative orbital ring */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-spin-slow" style={{ width: 500, height: 500, animationDuration: "40s" }}>
          <svg viewBox="0 0 500 500" className="h-full w-full">
            <circle cx="250" cy="250" r="240" fill="none" stroke="rgba(6,182,212,0.025)" strokeWidth="0.5" strokeDasharray="4 16" />
            <circle cx="250" cy="10" r="2" fill="rgba(6,182,212,0.12)" />
          </svg>
        </div>
      </div>

      {/* Top section line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 section-line" />

      {/* Dot grid background */}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 mx-auto max-w-2xl text-center"
      >
        <motion.div variants={fadeUp}>
          <span className="inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-cyan/70 font-mono mb-6">
            v0.12 — Cloud Integration
          </span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl lg:text-[4.5rem] drop-shadow-md"
        >
          Ready to build your
          <br />
          <span className="font-light text-white/80">first</span> <GradientText className="drop-shadow-lg">agent?</GradientText>
        </motion.h2>

        <motion.p variants={fadeUp} className="mt-8 text-lg text-muted-dark leading-relaxed sm:text-xl font-light">
          Download Personas for free. Start building in minutes.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-6 mx-auto grid max-w-xl grid-cols-1 gap-2 text-left sm:grid-cols-3">
          {[
            "Download installer",
            "Connect Claude CLI",
            "Launch first agent",
          ].map((step, index) => (
            <div key={step} className="rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-dark">Step {index + 1}</p>
              <p className="mt-1 text-xs text-muted">{step}</p>
            </div>
          ))}
        </motion.div>

        {/* Main CTA */}
        <motion.div variants={fadeUp} className="mt-10">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="relative inline-block rounded-full p-px bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple animate-border-flow">
              <a
                href="#"
                className="group relative inline-flex w-[min(100%,20rem)] items-center justify-center gap-3 overflow-hidden rounded-full bg-brand-cyan px-8 py-4 text-sm font-semibold text-black transition-all duration-300 hover:brightness-110 sm:w-auto sm:px-10 sm:py-4.5 sm:text-base"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Download className="relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span className="relative">Download for Windows</span>
              </a>
            </div>
            <a
              href="#features"
              className="inline-flex w-[min(100%,20rem)] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.015] px-6 py-3 text-sm font-medium text-muted transition-colors duration-300 hover:border-white/[0.15] hover:text-foreground sm:w-auto"
            >
              Explore capabilities first
            </a>
          </div>
        </motion.div>

        {/* Platform pills */}
        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {platforms.map((p) => (
            <div
              key={p.label}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
                p.available
                  ? "border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                  : "border-white/[0.04] bg-white/[0.01] text-muted-dark hover:border-white/[0.06]"
              }`}
            >
              <p.icon className="h-3.5 w-3.5" />
              {p.label}
              {p.available && (
                <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
              )}
              {!p.available && <span className="text-[10px] text-muted-dark/60">soon</span>}
            </div>
          ))}
        </motion.div>

        {/* Trust signals */}
        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-dark sm:gap-5">
          <span className="flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-brand-cyan/40" />
            Requires Claude CLI
          </span>
          <span className="hidden h-3 w-px bg-white/[0.06] sm:inline-block" />
          <span className="flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-brand-cyan/40" />
            12 MB installer
          </span>
          <span className="hidden h-3 w-px bg-white/[0.06] sm:inline-block" />
          <span className="flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-brand-cyan/40" />
            No telemetry
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
