"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { TRIGGERS } from "@/components/sections/orchestration-hub/data";
import { mix, timedLoop } from "../shared/scene-kit";
import TriggerScene from "../shared/TriggerScene";
import { BEAM_S, LENS_SCALE, orbitPose } from "./geometry";

interface OrbitNodeProps {
  index: number;
  /** The orbit's turn, in trigger steps (a spring): every pose derives from it. */
  turn: MotionValue<number>;
  on: boolean;
  live: boolean;
  still: boolean;
  onSelect: (id: string) => void;
}

/**
 * One trigger riding the orbit: a dim sphere on the far side passing behind
 * the agent; at the front, once the swing settles, the active one opens into a
 * lens showing its own scene - the moment it fires. Position, size, depth order and label
 * fade are all read from the orbit's turn, so the whole ring swings as one
 * body when the active trigger changes. A real button; `data-trigger-id` is the
 * guided tour's click target.
 */
export default function OrbitNode({ index, turn, on, live, still, onSelect }: OrbitNodeProps) {
  const trigger = TRIGGERS[index];
  const label = useTranslation().t.orchestrationSection.triggers[trigger.id].label;
  const tone = BRAND_VAR[trigger.brand];
  const Icon = trigger.icon;
  const left = useTransform(turn, (s) => orbitPose(index, s).left);
  const top = useTransform(turn, (s) => orbitPose(index, s).top);
  const scale = useTransform(turn, (s) => orbitPose(index, s).scale);
  const zIndex = useTransform(turn, (s) => orbitPose(index, s).zIndex);
  const opacity = useTransform(turn, (s) => orbitPose(index, s).opacity);
  const labelOpacity = useTransform(turn, (s) => orbitPose(index, s).labelOpacity);

  return (
    <motion.button
      type="button"
      data-trigger-id={trigger.id}
      aria-pressed={on}
      aria-label={label}
      onClick={() => onSelect(trigger.id)}
      className="group absolute w-[12cqw] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/70"
      style={{ left, top, zIndex, scale, opacity, x: "-50%", y: "-50%" }}
    >
      <motion.span
        className="relative flex aspect-square w-full items-center justify-center rounded-full border"
        style={{
          borderColor: on ? tone : "rgba(var(--surface-overlay), 0.14)",
          background: on
            ? `radial-gradient(circle at 50% 120%, ${mix(tone, 40)}, ${mix(tone, 8)} 70%), var(--background)`
            : "radial-gradient(circle at 34% 28%, rgba(var(--surface-overlay), 0.16), rgba(var(--surface-overlay), 0.03) 62%), var(--background)",
          boxShadow: on
            ? `0 0 0 4px ${mix(tone, 14)}, 0 0 70px ${mix(tone, 50)}, inset 0 0 24px ${mix(tone, 30)}`
            : "inset 0 -8px 18px rgba(var(--surface-overlay), 0.06), 0 12px 30px -16px rgba(var(--surface-overlay), 0.3)",
          transition: "box-shadow 600ms, border-color 600ms",
        }}
        initial={false}
        animate={{ scale: on ? LENS_SCALE : 1 }}
        transition={still ? { duration: 0 } : { type: "spring", stiffness: 110, damping: 16, delay: on ? 0.45 : 0 }}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border-2"
          style={{ borderColor: tone }}
          initial={false}
          animate={live && on ? { scale: [1, 1, 1.3], opacity: [0, 0.7, 0] } : { scale: 1, opacity: 0 }}
          transition={timedLoop(live && on, BEAM_S, [0, 0.04, 0.5], "easeOut")}
        />
        {on ? (
          <TriggerScene id={trigger.id} run={live} tone={tone} className="h-[86%] w-[86%]" />
        ) : (
          <Icon aria-hidden="true" className="h-[38%] w-[38%]" style={{ color: mix(tone, 85) }} />
        )}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute left-1/2 top-full mt-[0.7cqw] -translate-x-1/2 whitespace-nowrap text-[clamp(0.75rem,2.15cqw,1.0625rem)] font-semibold transition-colors group-hover:text-foreground"
        style={{ opacity: on ? 0 : labelOpacity, color: "var(--muted-dark)" }}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}
