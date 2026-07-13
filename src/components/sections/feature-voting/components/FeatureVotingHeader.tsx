"use client";

import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";

export function FeatureVotingHeader() {
  const { t } = useTranslation();
  const c = t.featureVoting;
  return (
    <motion.div variants={fadeUp} className="text-center relative">
      <span className="inline-block rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 text-base font-semibold tracking-widest uppercase text-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono mb-6">
        {c.eyebrow}
      </span>
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-6xl drop-shadow-md">
        {c.heading} <GradientText className="drop-shadow-lg">{c.headingGradient}</GradientText>
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
        {c.subheading}
      </p>
    </motion.div>
  );
}
