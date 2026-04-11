"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { PRICING_TIERS } from "@/data/pricing";

/* ── Accent helpers ───────────────────────────────────────────────── */

const ACCENT: Record<string, string> = {
  cyan: "#06b6d4",
  purple: "#a855f7",
  amber: "#fbbf24",
};

/* ── Compact tier card (landing page version) ─────────────────────── */

function TierPreview({ tier }: { tier: (typeof PRICING_TIERS)[number] }) {
  const color = ACCENT[tier.accent] ?? "#06b6d4";

  return (
    <motion.div
      variants={fadeUp}
      className={`relative flex flex-col rounded-xl border backdrop-blur-sm p-5 transition-all duration-300 ${
        tier.highlighted
          ? "border-brand-purple/30 bg-brand-purple/[0.04]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-brand-purple px-2.5 py-0.5 text-[10px] font-semibold text-white">
          <Sparkles className="h-2.5 w-2.5" />
          Popular
        </div>
      )}

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold tracking-tight" style={{ color }}>
          {tier.price}
        </span>
        {tier.period && (
          <span className="text-xs text-muted-dark">{tier.period}</span>
        )}
      </div>

      <h3 className="mt-1 text-sm font-semibold text-foreground">{tier.name}</h3>

      {tier.comingSoon && (
        <span role="status" aria-label="This plan is coming soon" className="mt-1.5 inline-flex w-fit rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-muted-dark">
          Coming soon
        </span>
      )}

      <ul className="mt-3 flex-1 space-y-1.5">
        {tier.features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-xs text-muted-dark">
            <Check className="mt-0.5 h-3 w-3 shrink-0" style={{ color }} />
            {f}
          </li>
        ))}
        {tier.features.length > 3 && (
          <li className="text-xs text-muted-dark/60">
            +{tier.features.length - 3} more
          </li>
        )}
      </ul>
    </motion.div>
  );
}

/* ── Section ──────────────────────────────────────────────────────── */

export default function Pricing() {
  return (
    <SectionWrapper id="pricing" aria-labelledby="pricing-heading">
      <motion.div variants={fadeUp} className="text-center relative">
        <SectionHeading id="pricing-heading">
          Simple,{" "}
          <GradientText className="drop-shadow-lg">transparent</GradientText>
          {" "}pricing
        </SectionHeading>
        <p className="mx-auto mt-8 max-w-2xl text-base text-muted leading-relaxed font-light">
          The desktop app is free forever. Cloud plans add always-on execution
          and team features when you&apos;re ready to scale.
        </p>
      </motion.div>

      {/* ── Tier cards ───────────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        className="mt-14 mx-auto max-w-4xl grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {PRICING_TIERS.map((tier) => (
          <TierPreview key={tier.name} tier={tier} />
        ))}
      </motion.div>

      {/* ── CTAs ─────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-4">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 px-8 py-3 text-sm font-semibold text-brand-cyan transition-colors hover:bg-brand-cyan/25"
        >
          See all plans and features
          <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="mx-auto max-w-4xl rounded-2xl border border-white/4 bg-white/1 px-4 py-3 sm:px-6">
          <p className="text-sm text-muted leading-relaxed text-center">
            Personas is a free desktop app for AI agent orchestration. You bring your own Claude subscription.
            <span className="mx-2 hidden sm:inline text-white/10">|</span>
            <span className="text-brand-cyan/70">We never touch your Anthropic bill.</span>
          </p>
        </div>

        <Link
          href="/compare"
          className="inline-flex items-center gap-1.5 text-sm text-brand-cyan/70 hover:text-brand-cyan transition-colors"
        >
          Compare with CrewAI, LangChain, n8n &amp; more
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </motion.div>
    </SectionWrapper>
  );
}
