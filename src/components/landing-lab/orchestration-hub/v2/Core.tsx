"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR } from "@/lib/brand-theme";
import { EYEBROW } from "@/lib/typography";
import type { TriggerDef } from "@/components/sections/orchestration-hub/data";
import { mix, timedLoop } from "../shared/scene-kit";
import { BEAM_S, CORE_R, CORE_X, CORE_Y, pct } from "./geometry";

interface CoreProps {
  trigger: TriggerDef;
  live: boolean;
  still: boolean;
}

/**
 * The agent, floating over the far side of the orbit: the persona portrait as
 * a lit sphere - shaded at the rim, lit from below in the colour of the
 * trigger whose signal is rising into it - with a halo that swells each time
 * the signal lands, and above it the name of the agent that wakes.
 */
export default function Core({ trigger, live, still }: CoreProps) {
  const { t } = useTranslation();
  const tone = BRAND_VAR[trigger.brand];
  const persona = t.orchestrationSection.triggers[trigger.id].persona;

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: pct.x(CORE_X - CORE_R), top: pct.y(CORE_Y - CORE_R), width: pct.x(CORE_R * 2), aspectRatio: "1" }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute -inset-[45%] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${mix(tone, 38)}, ${mix(tone, 10)} 55%, transparent)` }}
        initial={false}
        animate={live ? { scale: [1, 1, 1.18, 1], opacity: [0.55, 0.55, 1, 0.55] } : { scale: 1.08, opacity: 0.8 }}
        transition={timedLoop(live, BEAM_S, [0, 0.55, 0.66, 1], "easeOut")}
      />
      <div
        aria-hidden="true"
        className="relative h-full w-full overflow-hidden rounded-full border"
        style={{
          borderColor: mix(tone, 50),
          boxShadow: `0 0 0 10px ${mix(tone, 6)}, 0 30px 80px -20px ${mix(tone, 60)}`,
          transition: "border-color 700ms, box-shadow 700ms",
        }}
      >
        <Image src="/imgs/guide/agents-prompts-dark.png" alt="" width={240} height={240} className="hidden h-full w-full object-cover dark:block" />
        <Image src="/imgs/guide/agents-prompts-light.png" alt="" width={240} height={240} className="block h-full w-full object-cover dark:hidden" />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 38%, transparent 48%, color-mix(in srgb, var(--background) 70%, transparent) 100%), radial-gradient(90% 55% at 50% 108%, ${mix(tone, 60)}, transparent 70%)`,
            transition: "background 700ms",
          }}
        />
      </div>
      <div className="absolute bottom-full left-1/2 mb-[1.6cqw] flex -translate-x-1/2 flex-col items-center gap-1.5">
        <span className={EYEBROW} style={{ color: tone }}>
          {t.landingLab.hub.wakes}
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={trigger.id}
            initial={still ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
            transition={{ duration: still ? 0 : 0.4, delay: still ? 0 : 0.5 }}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[clamp(0.875rem,2.2cqw,1.125rem)] font-semibold text-foreground backdrop-blur-md"
            style={{ borderColor: mix(tone, 45), backgroundColor: "color-mix(in srgb, var(--background) 72%, transparent)" }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tone, boxShadow: `0 0 12px ${tone}` }} />
            {persona}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
