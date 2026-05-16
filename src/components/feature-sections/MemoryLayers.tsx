"use client";

import { motion } from "framer-motion";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";
import MemoryLayersStack from "./MemoryLayersStack";

export default function MemoryLayers() {
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
          Every task teaches your agents something new. Important lessons rise to
          the top while background context stays accessible —{" "}
          <span className="text-foreground font-medium">
            your agents get better the more they work.
          </span>
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="mt-10"
      >
        <MemoryLayersStack />
      </motion.div>

      {/* Capability pills */}
      <motion.div
        variants={fadeUp}
        className="mt-8 flex flex-wrap justify-center gap-2 relative z-10"
      >
        {[
          "Learns from every task",
          "Focuses on what matters most",
          "Finds relevant knowledge instantly",
          "Gets smarter over time",
        ].map((note) => (
          <span
            key={note}
            className="rounded-full border border-foreground/10 bg-foreground/[0.03] px-4 py-2 text-base text-foreground/85 backdrop-blur-sm"
          >
            {note}
          </span>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
