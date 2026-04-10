"use client";

import { motion } from "framer-motion";
import { Quote, Shield } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { TESTIMONIALS, USAGE_STATS, TRUST_BADGES } from "@/data/testimonials";

function TestimonialCard({
  quote,
  name,
  role,
  company,
  color,
}: {
  quote: string;
  name: string;
  role: string;
  company: string;
  color: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 transition-colors hover:border-white/[0.1]"
    >
      <Quote
        className="h-5 w-5 mb-4 opacity-30"
        style={{ color }}
      />
      <p className="text-sm text-muted leading-relaxed flex-1 mb-6">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted">
            {role} &middot; {company}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function SocialProof() {
  return (
    <SectionWrapper id="social-proof" aria-labelledby="social-proof-heading">
      {/* ── Stats bar ────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="mb-16 grid grid-cols-2 sm:grid-cols-4 gap-4 mx-auto max-w-3xl"
      >
        {USAGE_STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-5 text-center"
          >
            <span
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
            <span className="text-xs text-muted uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ── Heading ──────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="text-center mb-12">
        <SectionHeading id="social-proof-heading">
          Trusted by{" "}
          <GradientText className="drop-shadow-lg">builders</GradientText>
        </SectionHeading>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
          From solo developers to enterprise security teams — hear why they
          chose local-first agent orchestration.
        </p>
      </motion.div>

      {/* ── Testimonial grid ─────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={t.name} {...t} />
        ))}
      </motion.div>

      {/* ── Trust badges ─────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="mt-16">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="h-4 w-4 text-brand-emerald/50" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted">
            Built for trust
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2"
            >
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: badge.color }}
              />
              <span className="text-xs font-medium text-foreground">
                {badge.label}
              </span>
              <span className="text-xs text-muted hidden sm:inline">
                {badge.description}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
