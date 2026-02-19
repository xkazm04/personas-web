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
        <span className="inline-block rounded-full border border-brand-amber/20 bg-brand-amber/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-amber/70 font-mono mb-6">
          Pricing
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Start free, <GradientText>scale when ready</GradientText>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted leading-relaxed">
          Full-featured desktop app is free forever. Cloud adds 24/7 operation
          and team collaboration.
        </p>
        {/* Decorative line */}
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-brand-amber/15 to-transparent" />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {tiers.map((tier) => (
          <GlowCard
            key={tier.name}
            accent={tier.accent}
            highlighted={tier.highlighted}
            className="flex flex-col p-6 relative"
          >
            {/* Popular badge */}
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-purple/30 bg-brand-purple/15 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-brand-purple backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.12)]">
                  <Zap className="h-3 w-3" />
                  Popular
                </span>
              </div>
            )}

            {/* Background glow for highlighted */}
            {tier.highlighted && (
              <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-brand-purple/[0.04] blur-3xl" />
              </div>
            )}

            <div className="relative flex items-center justify-between">
              <h3 className="font-semibold">{tier.name}</h3>
              {tier.highlighted && (
                <div className="h-1.5 w-1.5 rounded-full bg-brand-purple shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
              )}
            </div>

            <div className="relative mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
              <span className="text-sm text-muted-dark">{tier.period}</span>
            </div>

            <div className="mt-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            <ul className="relative mt-5 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted group/feat">
                  <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-cyan/10 ring-1 ring-brand-cyan/[0.06] transition-all duration-300 group-hover/feat:ring-brand-cyan/15">
                    <Check className="h-2.5 w-2.5 text-brand-cyan" />
                  </div>
                  <span className="transition-colors duration-300 group-hover/feat:text-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <button
              className={`relative mt-8 w-full rounded-full py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer overflow-hidden ${tier.ctaStyle}`}
            >
              {/* Hover shimmer */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 hover:translate-x-full" />
              <span className="relative">{tier.cta}</span>
            </button>
          </GlowCard>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.01] px-5 py-2.5">
          <p className="text-xs text-muted-dark leading-relaxed">
            All plans require your own Claude subscription (Pro/Max). We never touch your Anthropic bill.
            <span className="mx-2 text-white/[0.06]">|</span>
            <span className="text-brand-cyan/50">Bring Your Own Infrastructure</span> — use your own cloud keys for unlimited execution.
          </p>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
