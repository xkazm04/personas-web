"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { TRIGGERS } from "./data";

interface TriggerDetailProps {
  activeId: string;
}

/**
 * Side panel that describes the currently active trigger — what fires it,
 * what persona it wakes, and a static blurb about combining triggers.
 */

export default function TriggerDetail({ activeId }: TriggerDetailProps) {
  const activeTrigger = TRIGGERS.find((t) => t.id === activeId)!;
  const activeVar = BRAND_VAR[activeTrigger.brand];
  const Icon = activeTrigger.icon;

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-2xl border p-6"
        style={{
          borderColor: "rgba(var(--surface-overlay), 0.08)",
          backgroundColor: "rgba(var(--surface-overlay), 0.02)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTrigger.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: tint(activeTrigger.brand, 16) }}
              >
                <Icon className="h-5 w-5" style={{ color: activeVar }} />
              </div>
              <div>
                <div
                  className="text-base font-mono uppercase tracking-wider"
                  style={{ color: activeVar }}
                >
                  Trigger
                </div>
                <div className="text-xl font-bold text-foreground">
                  {activeTrigger.label}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-base font-mono uppercase tracking-wider text-muted-dark mb-1">
                Fires when
              </div>
              <div className="text-base font-mono text-foreground">
                {activeTrigger.example}
              </div>
            </div>

            <div
              className="flex items-center gap-2 pt-4 border-t"
              style={{ borderColor: "rgba(var(--surface-overlay), 0.08)" }}
            >
              <span className="text-base font-mono uppercase tracking-wider text-muted-dark">
                →
              </span>
              <div
                className="flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{
                  border: `1px solid ${tint("cyan", 30)}`,
                  backgroundColor: tint("cyan", 8),
                }}
              >
                <Bot className="h-4 w-4" style={{ color: BRAND_VAR.cyan }} />
                <span className="text-base font-semibold text-foreground">
                  {activeTrigger.persona}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-base text-muted leading-relaxed">
        Any trigger can start any persona. Combine them with composite
        conditions, or chain the events they emit.
      </p>
    </div>
  );
}
