"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { leftModules, rightModules } from "./data";
import ModuleTag from "./components/ModuleTag";
import PulseGridDeck from "./variants/PulseGridDeck";

export default function ObservabilityDeck() {
  const copy = useTranslation().t.observeSection;
  const [filterPrefix, setFilterPrefix] = useState<string | null>(null);

  const handleTagClick = useCallback((prefix: string) => {
    setFilterPrefix((prev) => (prev === prefix ? null : prefix));
  }, []);

  return (
    <SectionWrapper fit="min" id="observe">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <SectionIntro
          heading={copy.heading}
          gradient={copy.headingGradient}
          description={copy.description}
          descriptionMaxWidth="max-w-xl"
          className="mb-0"
        />
      </motion.div>

      <motion.div
        data-tour-diagram="observe"
        data-stage-fixed
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 stage:mt-0 mx-auto max-w-6xl grid gap-6 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,200px)] items-start"
      >
        <div className="flex flex-col gap-3">
          {leftModules.map((m) => (
            <ModuleTag
              key={m.id}
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
              key={m.id}
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
