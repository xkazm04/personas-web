"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Monitor, Apple, Terminal } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { trackDownloadClick } from "@/lib/analytics";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import PrimaryCTA from "@/components/PrimaryCTA";
import SectionWrapper from "@/components/SectionWrapper";
import WaitlistModal from "@/components/WaitlistModal";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
const RELEASE_TITLE = process.env.NEXT_PUBLIC_RELEASE_TITLE || "Latest";
const RELEASE_DATE = process.env.NEXT_PUBLIC_RELEASE_DATE ?? "";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const platforms = [
  { icon: Monitor, label: "Windows", available: true },
  { icon: Apple, label: "macOS", available: false },
  { icon: Terminal, label: "Linux", available: false },
] as const;

export default function DownloadCTA() {
  const [waitlistPlatform, setWaitlistPlatform] = useState<(typeof platforms)[number] | null>(null);

  const isFresh = useMemo(() => {
    if (!RELEASE_DATE) return false;
    const released = new Date(RELEASE_DATE).getTime();
    return !isNaN(released) && Date.now() - released < SEVEN_DAYS_MS;
  }, []);

  return (
    <SectionWrapper id="download" dotGrid className="noise py-40 md:py-48">
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

      <div className="mx-auto max-w-2xl text-center">
        <motion.div variants={fadeUp}>
          <span className={`inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-cyan/70 font-mono mb-6${isFresh ? " animate-badge-pulse" : ""}`}>
            v{APP_VERSION} — {RELEASE_TITLE}
          </span>
        </motion.div>

        <motion.div variants={fadeUp}>
          <SectionHeading>
            Ready to build your
            <br />
            <span className="font-light text-white/80">first</span> <GradientText className="drop-shadow-lg">agent?</GradientText>
          </SectionHeading>
        </motion.div>

        <motion.p variants={fadeUp} className="mt-8 text-lg text-muted-dark leading-relaxed sm:text-xl font-light">
          Download Personas for free. Start building in minutes.
        </motion.p>

        <motion.div
          className="mt-6 mx-auto grid max-w-xl grid-cols-1 gap-2 text-left sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.6 } } }}
        >
          {[
            "Download installer",
            "Connect Claude CLI",
            "Launch first agent",
          ].map((step, index) => {
            const glowColor = index === 0
              ? "rgba(6,182,212,0.5)"
              : index === 1
                ? "rgba(109,133,224,0.5)"
                : "rgba(168,85,247,0.5)";
            return (
              <motion.div
                key={step}
                className="rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    boxShadow: [
                      `0 0 0px ${glowColor.replace("0.5", "0")}`,
                      `0 0 20px ${glowColor}, inset 0 0 12px ${glowColor.replace("0.5", "0.08")}`,
                      `0 0 0px ${glowColor.replace("0.5", "0")}`,
                    ],
                    borderColor: [
                      "rgba(255,255,255,0.05)",
                      glowColor.replace("0.5", "0.4"),
                      "rgba(255,255,255,0.05)",
                    ],
                    transition: {
                      opacity: { duration: 0.3 },
                      y: { duration: 0.3 },
                      boxShadow: { duration: 0.8, ease: "easeInOut" },
                      borderColor: { duration: 0.8, ease: "easeInOut" },
                    },
                  },
                }}
              >
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-dark">Step {index + 1}</p>
                <p className="mt-1 text-xs text-muted">{step}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main CTA */}
        <motion.div variants={fadeUp} className="mt-10">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div onClick={() => trackDownloadClick("windows")}>
              <PrimaryCTA href="#" icon={Download} label="Download for Windows" variant="solid" />
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
          {platforms.map((p) =>
            p.available ? (
              <div
                key={p.label}
                className="flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-2 text-xs font-medium text-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.06)] transition-all duration-300"
              >
                <p.icon className="h-3.5 w-3.5" />
                {p.label}
                <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
              </div>
            ) : (
              <button
                key={p.label}
                onClick={() => setWaitlistPlatform(p)}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.01] px-4 py-2 text-xs font-medium text-muted-dark transition-all duration-300 hover:border-brand-purple/20 hover:bg-brand-purple/5 hover:text-brand-purple/80"
              >
                <p.icon className="h-3.5 w-3.5" />
                {p.label}
                <span className="text-[10px]">notify me</span>
              </button>
            )
          )}
        </motion.div>

        {/* Trust signals */}
        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-dark sm:gap-6">
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
      </div>

      {/* Waitlist modal */}
      {waitlistPlatform && (
        <WaitlistModal
          platform={waitlistPlatform.label}
          platformIcon={waitlistPlatform.icon}
          open={!!waitlistPlatform}
          onClose={() => setWaitlistPlatform(null)}
        />
      )}
    </SectionWrapper>
  );
}
