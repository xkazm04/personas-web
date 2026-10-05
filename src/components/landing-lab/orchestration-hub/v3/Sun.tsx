"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { EYEBROW } from "@/lib/typography";
import { useTranslation } from "@/i18n/useTranslation";
import type { TriggerDef } from "@/components/sections/orchestration-hub/data";
import { mix, timedLoop } from "../shared/scene-kit";
import { SUN_R, SWEEP_S, W } from "./geometry";

/**
 * The agent as the sun on the horizon: the persona portrait in a disc centred
 * on the horizon line, haloed in the open ray's colour; the halo flares each
 * time a band of light lands. Half of it hangs below the line, between the
 * words, and under it the agent this trigger wakes - the story's last beat.
 */
export default function Sun({ trigger, live, still }: { trigger: TriggerDef; live: boolean; still: boolean }) {
  const { t } = useTranslation();
  const tone = BRAND_VAR[trigger.brand];

  return (
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 z-10 aspect-square -translate-x-1/2 translate-y-1/2"
      style={{ width: `${((SUN_R * 2) / W) * 100}%` }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute -inset-[60%] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${mix(tone, 42)}, ${mix(tone, 12)} 50%, transparent)` }}
        initial={false}
        animate={live ? { scale: [1, 1, 1.16, 1], opacity: [0.6, 0.6, 1, 0.6] } : { scale: 1.06, opacity: 0.85 }}
        transition={timedLoop(live, SWEEP_S, [0, 0.5, 0.6, 1], "easeOut")}
      />
      <div
        aria-hidden="true"
        className="relative h-full w-full overflow-hidden rounded-full border-2"
        style={{
          borderColor: mix(tone, 60),
          boxShadow: `0 0 0 8px ${mix(tone, 8)}, 0 0 60px ${mix(tone, 45)}`,
          transition: "border-color 700ms, box-shadow 700ms",
        }}
      >
        <Image src="/imgs/guide/agents-prompts-dark.png" alt="" width={240} height={240} className="hidden h-full w-full object-cover dark:block" />
        <Image src="/imgs/guide/agents-prompts-light.png" alt="" width={240} height={240} className="block h-full w-full object-cover dark:hidden" />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(80% 60% at 50% 0%, ${mix(tone, 40)}, transparent 70%), linear-gradient(to bottom, transparent 50%, color-mix(in srgb, var(--background) 55%, transparent))` }}
        />
      </div>
      <div className="absolute left-1/2 top-full mt-3 flex -translate-x-1/2 flex-col items-center gap-1.5">
        <span className={EYEBROW} style={{ color: tone }}>
          {t.landingLab.hub.wakes}
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={trigger.id}
            initial={still ? false : { opacity: 0, y: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 4 }}
            transition={{ duration: still ? 0 : 0.35, delay: still ? 0 : 0.3 }}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[clamp(0.9375rem,1.4cqw,1.125rem)] font-semibold text-foreground"
            style={{ borderColor: mix(tone, 45), backgroundColor: "color-mix(in srgb, var(--background) 72%, transparent)" }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tone, boxShadow: `0 0 12px ${tone}` }} />
            {t.orchestrationSection.triggers[trigger.id].persona}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
