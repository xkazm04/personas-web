"use client";

import { motion } from "framer-motion";
import { ArrowDown, Bot, Sparkles } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";

const pillars = [
  { icon: Bot, label: "Autonomous agents" },
  { icon: Sparkles, label: "Self-healing execution" },
];

export default function FeatureBridge() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      variants={staggerContainer}
      className="mx-auto mb-20 flex max-w-2xl flex-col items-center gap-5 text-center"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        {pillars.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-glass-hover bg-white/3 px-3 py-1.5 text-sm font-mono tracking-wide text-muted-dark"
          >
            <Icon className="h-3.5 w-3.5 text-brand-cyan opacity-70" />
            {label}
          </span>
        ))}
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="max-w-xl text-lg text-muted-dark leading-relaxed font-light"
      >
        You&rsquo;ve seen why agents outperform rigid workflows.
        Here&rsquo;s how <GradientText>Personas</GradientText> makes
        it possible&mdash;the building blocks behind every intelligent agent.
      </motion.p>

      <motion.div variants={fadeUp}>
        <ArrowDown className="h-4 w-4 text-brand-cyan/60 animate-bounce" />
      </motion.div>
    </motion.div>
  );
}
