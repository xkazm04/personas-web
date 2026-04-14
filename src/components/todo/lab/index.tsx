"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import type { LabTab } from "./types";
import TabSwitcher from "./components/TabSwitcher";
import ChatTab from "./components/ChatTab";
import ArenaTab from "./components/ArenaTab";
import EvolutionTab from "./components/EvolutionTab";
import EvalTab from "./components/EvalTab";

export default function Lab() {
  const [active, setActive] = useState<LabTab>("chat");

  return (
    <SectionWrapper id="lab">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <SectionIntro
          heading="The"
          gradient="Lab"
          description="Six ways to make your personas better — chat with them, fight them against each other, evolve them across generations, or score them on the dimensions that matter. Every improvement you keep is versioned and reversible."
          className="mb-0"
        />
      </motion.div>

      <TabSwitcher active={active} onSelect={setActive} />

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6 mx-auto max-w-4xl"
      >
        {active === "chat" && <ChatTab />}
        {active === "arena" && <ArenaTab />}
        {active === "evolution" && <EvolutionTab />}
        {active === "eval" && <EvalTab />}
      </motion.div>
    </SectionWrapper>
  );
}
