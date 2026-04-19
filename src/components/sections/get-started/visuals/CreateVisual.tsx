"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { VisualProps } from "./types";

const PROMPT =
  "Watch my GitHub PRs and post a summary to #reviews each morning";

const PERSONA_FIELDS = [
  { k: "Tools", v: "GitHub · Slack" },
  { k: "Trigger", v: "Schedule · 08:00" },
  { k: "Model", v: "Claude Sonnet" },
  { k: "Memory", v: "On" },
];

export function CreateVisual({ brand }: VisualProps) {
  const color = BRAND_VAR[brand];
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: "var(--border-glass-hover)",
          backgroundColor: "rgba(var(--surface-overlay), 0.02)",
        }}
      >
        <div className="mb-2 flex items-center gap-2 text-base font-mono uppercase tracking-wider text-muted-dark">
          <Sparkles className="h-3.5 w-3.5" style={{ color }} />
          New persona
        </div>
        <div className="font-mono text-base leading-relaxed text-foreground">
          &gt; {PROMPT}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="ml-0.5 inline-block"
          >
            _
          </motion.span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border p-4"
        style={{ borderColor: tint(brand, 30), backgroundColor: tint(brand, 6) }}
      >
        <div className="mb-3 flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: tint(brand, 20) }}
          >
            <Sparkles className="h-4 w-4" style={{ color }} />
          </div>
          <span className="text-base font-semibold text-foreground">
            PR Digest Persona
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-base">
          {PERSONA_FIELDS.map((f) => (
            <div
              key={f.k}
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: "rgba(var(--surface-overlay), 0.03)" }}
            >
              <div className="text-sm font-mono uppercase text-muted-dark">
                {f.k}
              </div>
              <div className="text-base text-foreground/85">{f.v}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
