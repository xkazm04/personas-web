"use client";

import { motion } from "framer-motion";
import { Dna } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { VisualBadge, VisualFrame } from "./chrome";
import type { VisualProps } from "./types";

const FITNESS_BARS = [
  { label: "v1", value: 62 },
  { label: "v2", value: 71 },
  { label: "v3", value: 78 },
  { label: "v4", value: 88 },
  { label: "v5", value: 94 },
];

export function ImproveVisual({ brand }: VisualProps) {
  const color = BRAND_VAR[brand];
  return (
    <VisualFrame gap="gap-5">
      <VisualBadge icon={Dna} label="Breeding cycle · fitness ↑" color={color} align="fit" />
      <div className="flex items-end justify-center gap-4 h-44">
        {FITNESS_BARS.map((b, i) => (
          <div key={b.label} className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${b.value}%` }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.6, ease: "easeOut" }}
              className="w-10 rounded-t-lg"
              style={{
                background: `linear-gradient(to top, ${tint(brand, 40)}, ${color})`,
                minHeight: 12,
              }}
            />
            <span className="text-base font-mono text-foreground/80 tabular-nums">
              {b.value}%
            </span>
            <span className="text-base font-mono text-muted-dark">{b.label}</span>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
