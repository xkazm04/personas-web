"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Radar } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";
import MemoryLayersStack from "./MemoryLayersStack";
import MemoryLayersNeural from "./MemoryLayersNeural";

type Variant = "stack" | "neural";

const VARIANTS: {
  key: Variant;
  label: string;
  icon: typeof Layers;
  blurb: string;
}[] = [
  {
    key: "stack",
    label: "Cortical Layers",
    icon: Layers,
    blurb: "Geological strata by category — most important at the surface",
  },
  {
    key: "neural",
    label: "Neural Hub",
    icon: Radar,
    blurb: "Central brain with four cortical arms radiating outward",
  },
];

export default function MemoryLayers() {
  const [active, setActive] = useState<Variant>("stack");

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

      {/* Variant tab switcher */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-10 mx-auto max-w-lg relative z-10"
      >
        <div className="flex items-center gap-1 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-1">
          {VARIANTS.map((v) => {
            const VIcon = v.icon;
            const isActive = active === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setActive(v.key)}
                aria-pressed={isActive}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-foreground/[0.08] text-foreground shadow-sm"
                    : "text-foreground/60 hover:text-foreground/85 hover:bg-foreground/[0.04]"
                }`}
              >
                <VIcon className="h-4 w-4" />
                {v.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-center text-base font-mono text-foreground/60 uppercase tracking-widest">
          {VARIANTS.find((v) => v.key === active)?.blurb}
        </div>
      </motion.div>

      {/* Active variant */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="mt-10"
        >
          {active === "stack" ? <MemoryLayersStack /> : <MemoryLayersNeural />}
        </motion.div>
      </AnimatePresence>

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
