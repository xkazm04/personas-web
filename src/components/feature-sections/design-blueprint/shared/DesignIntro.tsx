"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import TourLauncher from "@/components/tour/TourLauncher";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { DesignCopy } from "./copy";

/**
 * The section's heading identity ("One sentence. One matrix."), a lede and
 * the /features tour launcher - the only features-tour entry on the page, so
 * every variant keeps it. Lede and launcher share one row on the stage so the
 * art keeps the height.
 */
export default function DesignIntro({ copy, lede }: { copy: DesignCopy; lede: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="text-center"
      data-section-intro
    >
      <motion.div variants={fadeUp}>
        <SectionHeading>
          {copy.heading}{" "}
          <GradientText className="drop-shadow-lg">{copy.headingGradient}</GradientText>
          {copy.headingTrailing}
        </SectionHeading>
      </motion.div>
      <motion.div
        variants={fadeUp}
        className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-3 stage:mt-[1.2svh]"
      >
        <p data-section-lede className="text-base font-light text-foreground/85 md:text-lg">
          {lede}
        </p>
        <TourLauncher tourId="features" bridgeHref="/demo?tour=1" bridgeKey="dashboard" />
      </motion.div>
    </motion.div>
  );
}
