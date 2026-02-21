"use client";

import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    accent: "cyan" as const,
    cta: "Download Free",
    bestFor: "Solo builders getting started",
    capacity: 10,
    ctaStyle: "border border-white/[0.08] text-muted hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.02]",
    features: [
      "Unlimited local agents",
      "Local event bus & scheduler",
      "Full observability dashboard",
      "Design engine",
      "Team canvas (local)",
    ],
  },
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    accent: "cyan" as const,
    cta: "Get Started",
    bestFor: "Early production workloads",
    capacity: 35,
    ctaStyle: "border border-white/[0.08] text-muted hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.02]",
    features: [
      "Everything in Free",
      "1 cloud worker",
      "100 cloud executions/mo",
      "500 cloud events/mo",
      "5-min max timeout",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    accent: "purple" as const,
    highlighted: true,
    cta: "Go Pro",
    bestFor: "Fast-moving individual teams",
    capacity: 65,
    ctaStyle: "bg-brand-purple text-white hover:bg-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.15)]",
    features: [
      "Everything in Starter",
      "3 cloud workers",
      "1,000 executions/mo",
      "10,000 events/mo",
      "Burst auto-scaling",
    ],
  },
  {
    name: "Team",
    price: "$79",
    period: "/mo",
    accent: "emerald" as const,
    cta: "Contact Us",
    bestFor: "Multi-user operations",
    capacity: 90,
    ctaStyle: "border border-white/[0.08] text-muted hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.02]",
    features: [
      "Everything in Pro",
      "5 cloud workers",
      "5,000 executions/mo",
      "Team credential sharing",
      "Member invitations",
    ],
  },
];

export default function Pricing() {
  return (
    <SectionWrapper id="pricing" dotGrid>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[30%] h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.04) 0%, rgba(6,182,212,0.02) 40%, transparent 70%)" }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
          Start free,{" "}
          <span className="inline-block text-5xl sm:text-6xl md:text-[5.5rem] bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent drop-shadow-lg">
            scale
          </span>{" "}
          when ready
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">
          Full-featured desktop app is free forever. Cloud adds 24/7 operation
          and team collaboration.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 items-start"
      >
        {tiers.map((tier) => {
          const card = (
            <GlowCard
              key={tier.name}
              accent={tier.accent}
              highlighted={tier.highlighted}
              className={`flex flex-col p-5 sm:p-6 relative ${tier.highlighted ? "shimmer-surface" : ""}`}
            >
              {/* Popular badge */}
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-purple/40 bg-brand-purple/20 px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase text-brand-purple backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Background glow for highlighted */}
              {tier.highlighted && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-brand-purple/[0.06] blur-3xl" />
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full bg-brand-cyan/[0.03] blur-3xl" />
                </div>
              )}

              <div className="relative flex items-center justify-between">
                <h3 className={`font-semibold ${tier.highlighted ? "text-lg" : ""}`}>{tier.name}</h3>
                {tier.highlighted && (
                  <div className="h-2 w-2 rounded-full bg-brand-purple shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-glow-border" />
                )}
              </div>

              <div className="relative mt-5 flex items-baseline gap-1">
                <span className={`font-bold tracking-tight ${tier.highlighted ? "text-5xl" : "text-4xl"}`}>{tier.price}</span>
                <span className="text-sm text-muted-dark">{tier.period}</span>
              </div>

              <div className={`mt-2 h-px bg-gradient-to-r from-transparent to-transparent ${tier.highlighted ? "via-brand-purple/15" : "via-white/[0.06]"}`} />

              <div className="mt-4 rounded-xl border border-white/[0.04] bg-white/[0.01] px-3 py-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-dark/70">Best for</p>
                <p className="mt-1 text-xs text-muted">{tier.bestFor}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className={`h-full rounded-full ${tier.highlighted ? "bg-gradient-to-r from-brand-purple to-brand-cyan" : "bg-brand-cyan/50"}`}
                    style={{ width: `${tier.capacity}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-dark/60">Monthly cloud headroom</p>
              </div>

              <ul className="relative mt-5 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted group/feat">
                    <div className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      tier.highlighted
                        ? "bg-brand-purple/15 ring-1 ring-brand-purple/[0.12] group-hover/feat:ring-brand-purple/25"
                        : "bg-brand-cyan/10 ring-1 ring-brand-cyan/[0.06] group-hover/feat:ring-brand-cyan/15"
                    }`}>
                      <Check className={`h-2.5 w-2.5 ${tier.highlighted ? "text-brand-purple" : "text-brand-cyan"}`} />
                    </div>
                    <span className="transition-colors duration-300 group-hover/feat:text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`relative mt-8 w-full rounded-full text-sm font-medium transition-all duration-300 cursor-pointer overflow-hidden ${
                  tier.highlighted ? "py-3.5 shadow-[0_0_30px_rgba(168,85,247,0.2)]" : "py-2.5"
                } ${tier.ctaStyle}`}
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 hover:translate-x-full" />
                <span className="relative">{tier.cta}</span>
              </button>
            </GlowCard>
          );

          if (tier.highlighted) {
            return (
              <div key={tier.name} className="animated-conic-border p-[1px] rounded-2xl lg:-mt-6 lg:mb-6">
                {card}
              </div>
            );
          }
          return card;
        })}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-10 text-center">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 sm:px-5">
          <p className="text-xs text-muted-dark leading-relaxed">
            All plans require your own Claude subscription (Pro/Max). We never touch your Anthropic bill.
            <span className="mx-2 hidden text-white/[0.06] sm:inline">|</span>
            <span className="text-brand-cyan/50">Bring Your Own Infrastructure</span> — use your own cloud keys for unlimited execution.
          </p>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
