"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { ThemedChip } from "@/components/primitives";
import { scenarios } from "../data";

export default function ScenarioSelector({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-14 flex flex-wrap items-center justify-center gap-2"
    >
      {scenarios.map((s, i) => (
        <ThemedChip
          key={s.id}
          active={i === activeIndex}
          onClick={() => onSelect(i)}
          size="sm"
          mono
        >
          {s.label}
        </ThemedChip>
      ))}
    </motion.div>
  );
}
