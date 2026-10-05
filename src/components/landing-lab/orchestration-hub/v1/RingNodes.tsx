"use client";

import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import type { TriggerId } from "@/components/sections/orchestration-hub/data";
import { mix, timedLoop } from "../shared/scene-kit";
import { NODES, SIGNAL_S, TILE, pct } from "./geometry";

interface RingNodesProps {
  activeId: TriggerId;
  live: boolean;
  onSelect: (id: string) => void;
}

/**
 * The ten triggers as real buttons laid over the ring art (same view-box
 * geometry, as percentages). Glass tiles at rest; the active one is lit from
 * inside in its own colour, lifted, and emits a pulse on every signal beat.
 * `data-trigger-id` is the guided tour's click target.
 */
export default function RingNodes({ activeId, live, onSelect }: RingNodesProps) {
  const copy = useTranslation().t.orchestrationSection;

  return (
    <>
      {NODES.map(({ trigger, at }) => {
        const on = trigger.id === activeId;
        const tone = BRAND_VAR[trigger.brand];
        const Icon = trigger.icon;
        return (
          <button
            key={trigger.id}
            type="button"
            data-trigger-id={trigger.id}
            aria-pressed={on}
            onClick={() => onSelect(trigger.id)}
            className="group absolute flex flex-col items-center justify-center gap-[0.9cqw] rounded-[24%] border backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/70"
            style={{
              left: pct(at.x - TILE / 2),
              top: pct(at.y - TILE / 2),
              width: pct(TILE),
              height: pct(TILE),
              transform: on ? "scale(1.08)" : "scale(1)",
              borderColor: on ? mix(tone, 65) : "rgba(var(--surface-overlay), 0.1)",
              background: on
                ? `linear-gradient(160deg, ${mix(tone, 30)}, ${mix(tone, 8)} 70%), color-mix(in srgb, var(--background) 70%, transparent)`
                : "color-mix(in srgb, var(--background) 74%, transparent)",
              boxShadow: on
                ? `0 0 0 1px ${mix(tone, 22)}, 0 14px 40px -10px ${mix(tone, 70)}, inset 0 1px 0 ${mix(tone, 40)}`
                : "inset 0 1px 0 rgba(var(--surface-overlay), 0.07), 0 8px 24px -14px rgba(var(--surface-overlay), 0.25)",
              transition: "transform 500ms cubic-bezier(.22,1,.36,1), box-shadow 500ms, border-color 500ms",
            }}
          >
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[24%] border-2"
              style={{ borderColor: tone }}
              initial={false}
              animate={live && on ? { scale: [1, 1, 1.32], opacity: [0, 0.7, 0] } : { scale: 1, opacity: 0 }}
              transition={timedLoop(live && on, SIGNAL_S, [0, 0.04, 0.5], "easeOut")}
            />
            <Icon
              aria-hidden="true"
              className="h-[3.8cqw] w-[3.8cqw] transition-colors"
              style={{ color: on ? tone : "rgba(var(--surface-overlay), 0.6)" }}
            />
            <span
              className="px-1 text-center text-[clamp(0.75rem,2.7cqw,1.0625rem)] font-semibold leading-tight transition-colors group-hover:text-foreground"
              style={{ color: on ? "var(--foreground)" : "var(--muted-dark)" }}
            >
              {copy.triggers[trigger.id].label}
            </span>
          </button>
        );
      })}
    </>
  );
}
