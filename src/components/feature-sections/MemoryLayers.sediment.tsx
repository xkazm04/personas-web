"use client";

import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";
import SedimentArt from "./MemoryLayers.sediment.art";

/* /illustrate variant "sediment": every run settles into four coloured strata;
   the most important grains rise to the top, where recall catches them. */
export default function MemoryLayersSediment() {
  return (
    <SectionWrapper id="memory-layers" className="relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.05)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.04)_0%,transparent_60%)]" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center relative z-10"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Remembers what{" "}
            <GradientText className="drop-shadow-lg">works</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-xl text-foreground/85 font-light text-base md:text-lg"
        >
          Every task teaches your agents; the important lessons rise to the top.
        </motion.p>
      </motion.div>

      <div className="relative z-10">
        <SedimentArt />
      </div>
    </SectionWrapper>
  );
}
