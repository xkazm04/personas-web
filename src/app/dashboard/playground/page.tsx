"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import AgentPlayground from "@/components/sections/AgentPlayground";

export default function PlaygroundPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">Agent Playground</GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          Test agent prompts and preview execution output in a sandbox
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <AgentPlayground />
      </motion.div>
    </motion.div>
  );
}
