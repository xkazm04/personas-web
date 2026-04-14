"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { VisualProps } from "./types";

const PLATFORMS = [
  { name: "Windows", ready: true },
  { name: "macOS", ready: false },
  { name: "Linux", ready: false },
];

export function DownloadVisual({ brand }: VisualProps) {
  const color = BRAND_VAR[brand];
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ backgroundColor: tint(brand, 18) }}
      >
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
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
            className="flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{
              borderColor: "rgba(var(--surface-overlay), 0.08)",
              backgroundColor: "rgba(var(--surface-overlay), 0.02)",
            }}
          >
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
          </motion.div>
        ))}
      </div>
    </div>
  );
}
