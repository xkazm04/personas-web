import { motion } from "framer-motion";

import { ThemedChip } from "@/components/primitives";
import type { GuideMode } from "@/data/guide/types";
import { fadeUp } from "@/lib/animations";

import { MODE_OPTIONS } from "./guidePageData";

export function GuideModeToggle({
  modeFilter,
  onModeChange,
}: {
  modeFilter: GuideMode | null;
  onModeChange: (mode: GuideMode | null) => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-8 inline-flex items-center gap-1 rounded-full border p-1"
      style={{
        borderColor: "var(--border-glass-hover)",
        backgroundColor: "rgba(var(--surface-overlay), 0.02)",
      }}
    >
      {MODE_OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <ThemedChip
            key={option.label}
            brand={option.brand}
            active={modeFilter === option.value}
            onClick={() => onModeChange(option.value)}
            icon={<Icon className="h-4 w-4" />}
          >
            {option.label}
          </ThemedChip>
        );
      })}
    </motion.div>
  );
}
