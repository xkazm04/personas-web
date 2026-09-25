"use client";

import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";
import TourLauncher from "@/components/tour/TourLauncher";
import { useTranslation } from "@/i18n/useTranslation";
import DesignEngineMatrix from "./DesignEngineMatrix";

export default function DesignEngine() {
  const copy = useTranslation().t.designMatrix;
  return (
    <SectionWrapper fit="fill" id="design">
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
        <motion.p
          variants={fadeUp}
          data-section-lede
          className="mx-auto mt-4 max-w-4xl text-foreground/85 font-light text-base md:text-lg"
        >
          {copy.lede}{" "}
          <span className="text-foreground font-medium">{copy.ledeStrong}</span>
        </motion.p>
        <motion.div variants={fadeUp} className="mt-4 flex justify-center stage:mt-[1.2svh]">
          <TourLauncher tourId="features" bridgeHref="/demo?tour=1" bridgeKey="dashboard" />
        </motion.div>
      </motion.div>

      <motion.div
        data-tour-diagram="design"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        data-stage-slot
        className="mt-10"
      >
        <DesignEngineMatrix />
      </motion.div>
    </SectionWrapper>
  );
}
