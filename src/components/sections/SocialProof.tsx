"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { TESTIMONIALS, USAGE_STATS, TRUST_BADGES } from "@/data/testimonials";

/**
 * SocialProof — renders the previously-unused TESTIMONIALS / USAGE_STATS /
 * TRUST_BADGES data (src/data/testimonials.ts) as a quote wall with a stat row
 * and trust badges. Entrance animations inherit the SectionWrapper stagger root.
 */
export default function SocialProof() {
  return (
    <SectionWrapper id="social-proof" aria-labelledby="social-proof-heading">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div variants={fadeUp}>
          <SectionHeading id="social-proof-heading">
            Teams that ship with <GradientText>agents, not glue code</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mt-6 text-lg font-light text-muted-dark">
          Real teams replacing brittle workflows with self-healing Personas agents.
        </motion.p>
      </div>

      {/* Usage stats */}
      <motion.div
        variants={staggerContainer}
        className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {USAGE_STATS.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="rounded-2xl border border-glass bg-white/[0.02] px-4 py-6 text-center backdrop-blur-sm"
          >
            <div className="text-3xl font-bold tabular-nums" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="mt-1.5 text-xs font-mono uppercase tracking-wider text-muted-dark">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Testimonials */}
      <motion.div
        variants={staggerContainer}
        className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {TESTIMONIALS.map((item) => (
          <motion.figure
            key={item.name}
            variants={fadeUp}
            className="flex flex-col rounded-2xl border border-glass bg-white/[0.02] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-glass-hover hover:bg-white/[0.04]"
          >
            <span aria-hidden="true" className="font-serif text-4xl leading-none" style={{ color: item.color }}>
              &ldquo;
            </span>
            <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-foreground/80">
              {item.quote}
            </blockquote>
            <figcaption className="mt-4 border-t border-glass pt-4">
              <div className="text-sm font-medium text-foreground">{item.name}</div>
              <div className="mt-0.5 text-xs text-muted-dark">
                {item.role} &middot; {item.company}
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>

      {/* Trust badges */}
      <motion.div
        variants={staggerContainer}
        className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-3"
      >
        {TRUST_BADGES.map((badge) => (
          <motion.div
            key={badge.label}
            variants={fadeUp}
            className="flex items-center gap-2 rounded-full border border-glass-hover bg-white/[0.02] px-4 py-2 backdrop-blur-sm"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: badge.color }} />
            <span className="text-sm font-medium text-foreground/80">{badge.label}</span>
            <span className="text-xs text-muted-dark">{badge.description}</span>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
