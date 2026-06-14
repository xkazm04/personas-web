"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, STATE_COLORS } from "@/lib/brand-theme";
import { SURFACE_GLASS, VisualFrame } from "./chrome";
import type { VisualProps } from "./types";

const EVENTS = [
  { at: "08:00:00", label: "schedule.fired",     state: "done"    },
  { at: "08:00:01", label: "persona.started",    state: "done"    },
  { at: "08:00:04", label: "github.prs.fetched", state: "done"    },
  { at: "08:00:06", label: "digest.built",       state: "active"  },
  { at: "08:00:07", label: "slack.message.sent", state: "pending" },
];

export function WorkVisual({ brand }: VisualProps) {
  const color = BRAND_VAR[brand];
  return (
    <VisualFrame gap="gap-0">
      <div className="rounded-xl border p-4" style={SURFACE_GLASS}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full motion-safe:animate-pulse"
              style={{ backgroundColor: color }}
            />
            <span className="text-base font-mono uppercase tracking-wider text-foreground/80">
              Event bus · live
            </span>
          </div>
          <span className="text-base font-mono text-muted-dark">persona-42</span>
        </div>
        <div className="space-y-1.5">
          {EVENTS.map((e, i) => {
            const dotColor =
              e.state === "done"
                ? STATE_COLORS.success
                : e.state === "active"
                  ? color
                  : "rgba(var(--surface-overlay), 0.15)";
            return (
              <motion.div
                key={e.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.12 }}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ backgroundColor: "rgba(var(--surface-overlay), 0.02)" }}
              >
                <span className="text-base font-mono text-muted-dark tabular-nums">
                  {e.at}
                </span>
                <div
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
                <span className="text-base font-mono text-foreground/85 truncate">
                  {e.label}
                </span>
                {e.state === "done" && (
                  <Check
                    className="ml-auto h-3.5 w-3.5 shrink-0"
                    style={{ color: STATE_COLORS.success }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </VisualFrame>
  );
}
