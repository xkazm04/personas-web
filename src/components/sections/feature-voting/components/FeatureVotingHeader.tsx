import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

export function FeatureVotingHeader() {
  return (
    <motion.div variants={fadeUp} className="text-center relative">
      <span className="inline-block rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 text-base font-semibold tracking-widest uppercase text-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono mb-6">
        Community
      </span>
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-6xl drop-shadow-md">
        Vote for <GradientText className="drop-shadow-lg">what&apos;s next</GradientText>
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
        Help us prioritize. Pick the features that matter most to you and shape the future of Personas.
      </p>
    </motion.div>
  );
}
