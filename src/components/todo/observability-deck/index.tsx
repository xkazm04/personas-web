"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import SectionIntro from "@/components/primitives/SectionIntro";
import { BRAND_VAR } from "@/lib/brand-theme";
import { staggerContainer } from "@/lib/animations";
import { leftModules, rightModules } from "./data";
import ModuleTag from "./components/ModuleTag";
import AnimatedMetric from "./components/AnimatedMetric";
import ActivityFeed from "./components/ActivityFeed";
import { useActivityFeed } from "./useActivityFeed";

export default function ObservabilityDeck() {
  const { activity, newRow } = useActivityFeed();

  return (
    <SectionWrapper id="observe">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <SectionIntro
          heading="See everything,"
          gradient="miss nothing"
          description="Watch your agents work in real time. Every execution, message, event, and memory — streaming through one dashboard, zero setup required."
          descriptionMaxWidth="max-w-xl"
          className="mb-0"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 mx-auto max-w-6xl grid gap-6 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,200px)] items-start"
      >
        <div className="flex flex-col gap-3">
          {leftModules.map((m) => (
            <ModuleTag key={m.title} mod={m} />
          ))}
        </div>

        <div className="force-dark rounded-2xl border border-foreground/[0.08] bg-background/80 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <TerminalChrome
            title="observability-deck"
            status="streaming"
            info="real-time"
            className="px-5 py-3"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.04] border-b border-foreground/[0.04]">
            <AnimatedMetric target={96.2} suffix="%" color={BRAND_VAR.emerald} label="Success rate" trend="+2.1%" />
            <AnimatedMetric target={3.4} suffix="s" color={BRAND_VAR.cyan} label="Avg duration" trend="-0.8s" />
            <AnimatedMetric target={0.14} prefix="$" suffix="" color={BRAND_VAR.amber} label="Avg cost" trend="-12%" />
            <AnimatedMetric target={12} suffix="" color={BRAND_VAR.purple} label="Active agents" trend="+3" />
          </div>

          <ActivityFeed activity={activity} newRow={newRow} />

          <div className="flex items-center justify-between border-t border-foreground/[0.04] px-5 py-2.5 text-base font-mono tracking-wider uppercase text-foreground/70">
            <span>Live event stream</span>
            <span className="text-brand-emerald">auto-refreshing</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {rightModules.map((m) => (
            <ModuleTag key={m.title} mod={m} />
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
