"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import GlowCard from "@/components/GlowCard";
import { fadeUp, TRANSITION_NORMAL } from "@/lib/animations";
import { cardOrchestrator, heroSlideIn, gridCardVariants, connectorDraw, features } from "./data";
import FeatureCardHeader from "./components/FeatureCardHeader";
import GuideLinks from "./components/GuideLinks";
import ProgressionThread from "./components/ProgressionThread";
import FeatureBridge from "./components/FeatureBridge";

export default function Features() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper id="features">
      <FeatureBridge />

      <motion.div variants={fadeUp} className="relative">
        <span className="pointer-events-none absolute -top-6 -left-2 select-none font-mono font-bold text-[6rem] sm:text-[8rem] leading-none text-white/60">
          01–04
        </span>

        <SectionIntro
          eyebrow="Platform"
          heading="Everything you need to"
          gradient="build & operate"
          description="A complete platform for designing, testing, executing, and monitoring AI agents — from your desktop."
          align="left"
          className="mb-0"
        />
      </motion.div>

      <motion.div variants={cardOrchestrator} className="relative mt-16">
        <ProgressionThread features={features} />

        <div className="md:pl-10 space-y-6">
          <div className="p-px rounded-2xl">
            <GlowCard
              accent={features[0].accent}
              texture="dense-grid"
              className="p-6 md:p-8 rounded-2xl"
              variants={heroSlideIn}
            >
              <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                <div>
                  <FeatureCardHeader f={features[0]} />
                  <p className="mt-4 text-base leading-relaxed text-muted">{features[0].description}</p>
                  <GuideLinks topics={features[0].guideTopics} layout="row" />
                </div>
                <div>{features[0].visual}</div>
              </div>
            </GlowCard>
          </div>

          <svg className="pointer-events-none mx-auto block h-8 w-px overflow-visible" viewBox="0 0 2 32">
            <motion.line
              x1="1"
              y1="0"
              x2="1"
              y2="32"
              stroke="rgba(168,85,247,0.15)"
              strokeWidth="1"
              strokeDasharray="3 3"
              variants={connectorDraw}
            />
          </svg>

          <div className="grid gap-6 md:grid-cols-3">
            {features.slice(1).map((f, i) => (
              <motion.div
                key={f.title}
                variants={gridCardVariants[i]}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02, boxShadow: `0 0 20px rgba(255,255,255,0.05)` }}
                transition={TRANSITION_NORMAL}
              >
                <GlowCard accent={f.accent} className="p-6 md:p-8 h-full">
                  <FeatureCardHeader f={f} />
                  <p className="mt-4 text-base leading-relaxed text-muted">{f.description}</p>
                  {f.visual}
                  <GuideLinks topics={f.guideTopics} layout="stack" />
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
