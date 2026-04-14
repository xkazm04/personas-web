"use client";

import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";
import DesignEngineMatrix from "./DesignEngineMatrix";

export default function DesignEngine() {
  return (
    <SectionWrapper id="design">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            One sentence. One{" "}
            <GradientText className="drop-shadow-lg">matrix</GradientText>.
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-foreground/85 font-light text-base md:text-lg"
        >
          Every persona is eight cells of truth — tasks, apps, triggers, review,
          messages, memory, errors, events. Describe what you want;{" "}
          <span className="text-foreground font-medium">
            Personas fills the matrix cell by cell and asks only when it needs you.
          </span>
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-10"
      >
        <DesignEngineMatrix />
      </motion.div>
    </SectionWrapper>
  );
}
