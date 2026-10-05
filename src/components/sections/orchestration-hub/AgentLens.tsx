"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { TriggerDef } from "@/components/sections/orchestration-hub/data";
import { mix, timedLoop } from "./shared/scene-kit";
import { C, HUB_R, SIGNAL_S, pct } from "./geometry";

interface AgentLensProps {
  trigger: TriggerDef;
  live: boolean;
  still: boolean;
}

/**
 * The agent at the centre: the persona portrait behind a lit glass lens that
 * swells each time a signal lands, and under it the name of the agent this
 * trigger wakes - the end of the story the comet starts.
 */
export default function AgentLens({ trigger, live, still }: AgentLensProps) {
  const copy = useTranslation().t.orchestrationSection;
  const tone = BRAND_VAR[trigger.brand];
  const persona = copy.triggers[trigger.id].persona;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute overflow-hidden rounded-full border"
        style={{
          left: pct(C - HUB_R),
          top: pct(C - HUB_R),
          width: pct(HUB_R * 2),
          height: pct(HUB_R * 2),
          borderColor: mix(tone, 55),
          transition: "border-color 600ms",
        }}
        initial={false}
        animate={{
          boxShadow: live
            ? [`0 0 30px ${mix(tone, 25)}`, `0 0 30px ${mix(tone, 25)}`, `0 0 70px ${mix(tone, 60)}`, `0 0 30px ${mix(tone, 25)}`]
            : `0 0 50px ${mix(tone, 40)}`,
        }}
        transition={timedLoop(live, SIGNAL_S, [0, 0.52, 0.6, 1], "easeOut")}
      >
        <Image src="/imgs/guide/agents-prompts-dark.png" alt="" width={160} height={160} className="hidden h-full w-full object-cover dark:block" />
        <Image src="/imgs/guide/agents-prompts-light.png" alt="" width={160} height={160} className="block h-full w-full object-cover dark:hidden" />
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 50% 120%, ${mix(tone, 45)}, transparent 60%)`, boxShadow: `inset 0 0 24px ${mix(tone, 35)}` }} />
      </motion.div>

      <div
        className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 justify-center"
        style={{ left: "50%", top: pct(C + HUB_R + 2) }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={trigger.id}
            initial={still ? false : { opacity: 0, y: -6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 4 }}
            transition={{ duration: still ? 0 : 0.35, delay: still ? 0 : 0.25 }}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-[clamp(0.75rem,2.4cqw,0.9375rem)] font-semibold text-foreground backdrop-blur-md"
            style={{ borderColor: mix(tone, 45), backgroundColor: "color-mix(in srgb, var(--background) 70%, transparent)" }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tone, boxShadow: `0 0 10px ${tone}` }} />
            {persona}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
