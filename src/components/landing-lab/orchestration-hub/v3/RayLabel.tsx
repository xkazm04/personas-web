"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import type { TriggerDef } from "@/components/sections/orchestration-hub/data";
import { mix } from "../shared/scene-kit";
import { LABEL_R, LABEL_STAGGER, at, pctX, pctY } from "./geometry";

interface RayLabelProps {
  trigger: TriggerDef;
  /** Ray index: odd narrow rays hang their label on the outer track. */
  index: number;
  a0: MotionValue<number>;
  a1: MotionValue<number>;
  on: boolean;
  onSelect: (id: string) => void;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * A ray's name, set just beyond the rim and anchored away from the sun (left
 * rays hang their label to the left, the top ones sit above), riding the same
 * springs as the ray. This is the real button for the trigger and the guided
 * tour's `data-trigger-id` target.
 */
export default function RayLabel({ trigger, index, a0, a1, on, onSelect }: RayLabelProps) {
  const label = useTranslation().t.orchestrationSection.triggers[trigger.id].label;
  const tone = BRAND_VAR[trigger.brand];
  const mid = useTransform([a0, a1], ([s, e]: number[]) => (s + e) / 2);
  const r = LABEL_R + (!on && index % 2 ? LABEL_STAGGER : 0);
  const left = useTransform(mid, (m) => pctX(at(r, m).x));
  const top = useTransform(mid, (m) => pctY(at(r, m).y));
  const x = useTransform(mid, (m) => `${r1(-50 + 50 * Math.cos(rad(m)))}%`);
  const y = useTransform(mid, (m) => `${r1(-50 + 50 * Math.sin(rad(m)))}%`);

  return (
    <motion.button
      type="button"
      data-trigger-id={trigger.id}
      aria-pressed={on}
      onClick={() => onSelect(trigger.id)}
      className="absolute whitespace-nowrap rounded-full border px-[0.7em] py-[0.25em] text-[clamp(0.8125rem,1.45cqw,1.125rem)] font-semibold backdrop-blur-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/70"
      style={{
        left,
        top,
        x,
        y,
        color: on ? "var(--foreground)" : "var(--muted-dark)",
        borderColor: on ? mix(tone, 60) : "transparent",
        backgroundColor: on ? mix(tone, 16) : "transparent",
        boxShadow: on ? `0 0 24px ${mix(tone, 30)}` : "none",
      }}
    >
      {label}
    </motion.button>
  );
}
