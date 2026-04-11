"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  ChevronDown,
  Download,
  ArrowRight,
  Sparkles,
  Building2,
} from "lucide-react";
import {
  PRICING_TIERS,
  COMPARISON_FEATURES,
  TIER_COLUMNS,
} from "@/data/pricing";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";

/* ── Accent colour helpers ────────────────────────────────────────── */

const ACCENT_COLORS: Record<string, string> = {
  cyan: "#06b6d4",
  purple: "#a855f7",
  amber: "#fbbf24",
};

/* ── Tier card ────────────────────────────────────────────────────── */

function TierCard({
  tier,
}: {
  tier: (typeof PRICING_TIERS)[number];
}) {
  const color = ACCENT_COLORS[tier.accent] ?? "#06b6d4";

  return (
    <motion.div
      variants={fadeUp}
      className={`relative flex flex-col rounded-2xl border backdrop-blur-sm p-6 transition-all duration-300 ${
        tier.highlighted
          ? "border-brand-purple/30 bg-brand-purple/[0.04] scale-[1.02] shadow-lg shadow-brand-purple/5"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-brand-purple px-3 py-0.5 text-xs font-semibold text-white">
          <Sparkles className="h-3 w-3" />
          Most Popular
        </div>
      )}

      {tier.comingSoon && (
        <span role="status" aria-label="This plan is coming soon" className="mb-3 inline-flex w-fit items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-xs font-medium text-muted-dark">
          Coming soon
        </span>
      )}

      <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold tracking-tight" style={{ color }}>
          {tier.price}
        </span>
        {tier.period && (
          <span className="text-sm text-muted-dark">{tier.period}</span>
        )}
      </div>

      <p className="mt-2 text-sm text-muted-dark">{tier.bestFor}</p>

      {/* Capacity bar */}
      <div className="mt-4 mb-1">
        <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${tier.capacity}%`,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
            }}
          />
        </div>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-dark">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={tier.href ?? "#"}
        className={`mt-6 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${tier.ctaStyle}`}
      >
        {!tier.comingSoon && tier.name === "Local" && <Download className="h-4 w-4" />}
        {tier.comingSoon && tier.name === "Builder" && <Building2 className="h-4 w-4" />}
        {tier.cta}
      </Link>
    </motion.div>
  );
}

/* ── Feature comparison matrix ────────────────────────────────────── */

function ComparisonMatrix() {
  const [open, setOpen] = useState(true);

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <h2 className="text-2xl font-bold text-center mb-10">
          Compare <GradientText>every feature</GradientText>
        </h2>

        <div role="table" aria-label="Feature comparison across pricing tiers" className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          {/* Header row */}
          <div role="row" className="grid grid-cols-[1fr_80px_80px_80px] sm:grid-cols-[1fr_120px_120px_120px] items-center gap-2 px-4 sm:px-6 py-4 border-b border-white/[0.08] bg-white/[0.03]">
            <span role="columnheader" className="text-sm font-semibold text-foreground">Feature</span>
            {TIER_COLUMNS.map((col) => (
              <span key={col.key} role="columnheader" className="text-center text-sm font-semibold" style={{ color: col.accent }}>
                {col.name}
              </span>
            ))}
          </div>

          {/* Toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 sm:px-6 py-3 text-left transition-colors hover:bg-white/[0.02] border-b border-white/[0.04]"
          >
            <span className="text-xs font-medium text-muted-dark uppercase tracking-wider">
              {open ? "Collapse" : "Expand"} feature list
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-dark transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {/* Feature rows */}
          {open && (
            <div>
              {COMPARISON_FEATURES.map((row) => (
                <div
                  role="row"
                  key={row.label}
                  className="grid grid-cols-[1fr_80px_80px_80px] sm:grid-cols-[1fr_120px_120px_120px] items-center gap-2 px-4 sm:px-6 py-3 border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.015] transition-colors"
                >
                  <span role="rowheader" className="text-sm text-muted-dark">{row.label}</span>
                  {[row.free, row.pro, row.enterprise].map((val, ci) => (
                    <div key={ci} role="cell" aria-label={val ? "Included" : "Not included"} className="flex justify-center">
                      {val ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-emerald/15">
                          <Check className="h-3.5 w-3.5 text-brand-emerald" aria-hidden="true" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
                          <X className="h-3.5 w-3.5 text-muted-dark/40" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

/* ── FAQ ───────────────────────────────────────────────────────────── */

const PRICING_FAQ = [
  {
    q: "Is the desktop app really free?",
    a: "Yes. The Personas desktop app is free forever with unlimited local agents, full observability, the testing lab, and all core features. You only pay if you want cloud execution for 24/7 availability.",
  },
  {
    q: "Do I need my own AI provider subscription?",
    a: "Yes. Personas orchestrates AI models but doesn't include model access. You'll need an API key from Claude (Anthropic), OpenAI, Google Gemini, or another supported provider. Most offer free credits to get started.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Absolutely. Upgrade or downgrade whenever you want. Your agents, credentials, memories, and data are always preserved. Downgrading disables tier-specific features but never deletes anything.",
  },
  {
    q: "What is BYOI (Bring Your Own Infrastructure)?",
    a: "BYOI lets you connect your own cloud provider credentials (AWS, GCP, Azure) instead of using our managed infrastructure. Personas provisions and manages the workers on your account — unlimited execution without per-month caps.",
  },
  {
    q: "How does cloud execution billing work?",
    a: "Cloud plans include a set number of workers and executions per month. You're billed monthly with no long-term commitment. Usage beyond your plan's limit pauses execution until the next billing cycle or you upgrade.",
  },
  {
    q: "Is there a free trial for cloud plans?",
    a: "Team plans include a 14-day free trial. No credit card required to start. You can test cloud workers, shared libraries, and team pipelines before committing.",
  },
];

function PricingFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="text-2xl font-bold text-center mb-10"
      >
        Pricing <GradientText>FAQ</GradientText>
      </motion.h2>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="space-y-3"
      >
        {PRICING_FAQ.map((item, i) => (
          <motion.div
            key={item.q}
            variants={fadeUp}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              aria-expanded={openIdx === i}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground"
            >
              {item.q}
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-dark transition-transform duration-200 ${
                  openIdx === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted-dark">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── Enterprise CTA ───────────────────────────────────────────────── */

function EnterpriseCTA() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="rounded-2xl p-[1px]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #fbbf2444, #fbbf2411)",
        }}
      >
        <div className="flex flex-col items-center gap-5 rounded-2xl bg-[#09090b] px-8 py-12 text-center">
          <Building2 className="h-10 w-10 text-amber-400" />
          <h2 className="text-2xl font-bold">
            Need a custom plan?
          </h2>
          <p className="max-w-lg text-sm text-muted-dark leading-relaxed">
            Builder plans include SSO, audit logs, BYOI deployment, dedicated
            support, and custom model endpoints. Let&apos;s design a plan that
            fits your organization.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="mailto:team@personas.ai"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
            >
              Contact Sales
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#download"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/70 transition hover:text-white"
            >
              <Download className="h-4 w-4" />
              Download Free
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090b] text-white">
      {/* Radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-10 blur-[120px] bg-brand-purple" />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-5xl px-6 pt-32 pb-4 text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            Simple, <GradientText>transparent</GradientText> pricing
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-dark leading-relaxed"
          >
            The desktop app is free forever. Cloud plans add always-on execution
            and team features when you&apos;re ready to scale.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Tier cards ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PRICING_TIERS.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </motion.div>
      </section>

      {/* ── Feature comparison matrix ────────────────────────────── */}
      <ComparisonMatrix />

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <PricingFAQ />

      {/* ── Enterprise CTA ───────────────────────────────────────── */}
      <EnterpriseCTA />
    </main>
  );
}
