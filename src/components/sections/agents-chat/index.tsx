"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { ThemedChip } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { scenarios } from "./data";
import { useChatSequence } from "./use-chat-sequence";
import ChatTimelineVariant from "./components/ChatTimelineVariant";
import ChatProgressBar from "./components/ChatProgressBar";

export default function AgentsChat() {
  const {
    activeIndex,
    setActiveIndex,
    wfVisibleCount,
    agVisibleCount,
    wfTyping,
    agTyping,
    showSatisfaction,
    paused,
    setPaused,
    hovered,
    setHovered,
    cycleMs,
  } = useChatSequence();

  const scenario = scenarios[activeIndex];

  const view = {
    scenario,
    wfVisibleCount,
    agVisibleCount,
    wfTyping,
    agTyping,
    showSatisfaction,
  };

  return (
    <SectionWrapper
      id="agents-chat"
      aria-label="Agents vs Workflows chat comparison"
    >
      <SectionIntro
        heading="Same Message,"
        gradient="Different Intelligence"
        description="Same customer message, two very different experiences. See why intelligence matters more than rules."
        className="mb-10"
      />

      <motion.div
        variants={fadeUp}
        className="mb-8 flex flex-wrap items-center justify-center gap-2"
      >
        {scenarios.map((s, i) => (
          <ThemedChip
            key={s.id}
            active={i === activeIndex}
            onClick={() => {
              setActiveIndex(i);
              setPaused(true);
            }}
            size="sm"
            mono
          >
            {s.name}
          </ThemedChip>
        ))}
      </motion.div>

      <motion.div
        variants={fadeUp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <ChatTimelineVariant {...view} />
      </motion.div>

      <ChatProgressBar
        activeIndex={activeIndex}
        paused={paused}
        hovered={hovered}
        cycleMs={cycleMs}
        onSelect={(i) => {
          setActiveIndex(i);
          setPaused(true);
        }}
        onTogglePause={() => setPaused((v) => !v)}
      />
    </SectionWrapper>
  );
}
