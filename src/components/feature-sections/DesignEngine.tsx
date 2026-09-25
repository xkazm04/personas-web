"use client";

import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";
import DesignEngineMatrix from "./DesignEngineMatrix";

export default function DesignEngine() {
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
            One sentence. One{" "}
            <GradientText className="drop-shadow-lg">matrix</GradientText>.
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          data-section-lede
          className="mx-auto mt-4 max-w-4xl text-foreground/85 font-light text-base md:text-lg"
        >
          Describe what you want.{" "}
          <span className="text-foreground font-medium">
            Personas fills the matrix cell by cell and asks only when it needs you.
          </span>
        </motion.p>
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
