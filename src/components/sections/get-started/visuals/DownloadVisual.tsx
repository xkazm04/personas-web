"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { VisualFrame, VisualRow } from "./chrome";
import type { VisualProps } from "./types";

const PLATFORMS = [
  { name: "Windows", ready: true },
  { name: "macOS", ready: false },
  { name: "Linux", ready: false },
];

export function DownloadVisual({ brand }: VisualProps) {
  const color = BRAND_VAR[brand];
  // Ambient loop: still for reduced motion and on a hidden tab. A rest pose
  // (not `undefined`) so a loop already running is replaced, not left going.
  const reduced = useStillMotion();
  const hidden = usePageVisibility();
  const still = reduced || hidden;
  return (
    <VisualFrame>
      <div
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ backgroundColor: tint(brand, 18) }}
      >
        <motion.div
          animate={still ? { y: 0 } : { y: [0, 4, 0] }}
          transition={still ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Download className="h-10 w-10" style={{ color }} />
        </motion.div>
      </div>
      <div className="space-y-2">
        {PLATFORMS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.12 }}
          >
            <VisualRow>
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: p.ready
                    ? color
                    : "rgba(var(--surface-overlay), 0.15)",
                }}
              />
              <span className="text-base font-medium text-foreground">{p.name}</span>
              <span className="ml-auto text-base font-mono text-muted-dark">
                {p.ready ? "Available" : "Coming soon"}
              </span>
            </VisualRow>
          </motion.div>
        ))}
      </div>
    </VisualFrame>
  );
}
