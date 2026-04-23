"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { leftModules, rightModules } from "./data";
import ModuleTag from "./components/ModuleTag";
import PulseGridDeck from "./variants/PulseGridDeck";

export default function ObservabilityDeck() {
  const [filterPrefix, setFilterPrefix] = useState<string | null>(null);

  const handleTagClick = useCallback((prefix: string) => {
    setFilterPrefix((prev) => (prev === prefix ? null : prefix));
  }, []);

  return (
    <SectionWrapper id="observe">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <SectionIntro
          heading="See everything,"
          gradient="miss nothing"
          description="Watch your agents work in real time. Every execution, message, event, and memory — streaming through one dashboard, zero setup required."
          descriptionMaxWidth="max-w-xl"
          className="mb-0"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 mx-auto max-w-6xl grid gap-6 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,200px)] items-start"
      >
        <div className="flex flex-col gap-3">
          {leftModules.map((m) => (
            <ModuleTag
              key={m.title}
              mod={m}
              active={filterPrefix === m.filterPrefix}
              onClick={() => handleTagClick(m.filterPrefix)}
            />
          ))}
        </div>

        <PulseGridDeck
          filterPrefix={filterPrefix}
          onClearFilter={() => setFilterPrefix(null)}
        />

        <div className="flex flex-col gap-3">
          {rightModules.map((m) => (
            <ModuleTag
              key={m.title}
              mod={m}
              active={filterPrefix === m.filterPrefix}
              onClick={() => handleTagClick(m.filterPrefix)}
            />
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
