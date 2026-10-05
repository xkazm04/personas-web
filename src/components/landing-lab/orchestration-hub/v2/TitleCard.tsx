"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { EYEBROW } from "@/lib/typography";
import { useTranslation } from "@/i18n/useTranslation";
import { triggerWords } from "@/components/sections/orchestration-hub/data";
import { mix } from "../shared/scene-kit";
import type { HubPlayback } from "../shared/useHubPlayback";
import TypedLine from "./TypedLine";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The title card: no panel, just type on the stage. An outlined numeral
 * stands behind the trigger's name, which rises out of a mask at display
 * size; the description follows, then the firing condition types itself in.
 * Polite live region only while the visitor drives.
 */
export default function TitleCard({ hub }: { hub: HubPlayback }) {
  const copy = useTranslation().t.orchestrationSection;
  const trigger = hub.trigger;
  const words = triggerWords(copy, trigger);
  const tone = BRAND_VAR[trigger.brand];
  const Icon = trigger.icon;
  const enter = (delay: number) =>
    hub.still
      ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE, delay } };

  return (
    <div aria-live={hub.stopped ? "polite" : "off"} className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={trigger.id}
          exit={hub.still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: -24, filter: "blur(6px)", transition: { duration: 0.28 } }}
        >
          <div className="relative">
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute -top-[9cqh] right-0 select-none font-mono text-[clamp(4rem,22cqh,10rem)] font-bold leading-none tracking-tighter"
              style={{ color: "transparent", WebkitTextStroke: `1.5px ${mix(tone, 30)}` }}
              {...enter(0)}
            >
              {String(hub.state.active + 1).padStart(2, "0")}
            </motion.span>
            <motion.div className="relative flex items-center gap-2.5" {...enter(0.05)}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: mix(tone, 16) }}>
                <Icon className="h-4 w-4" style={{ color: tone }} aria-hidden="true" />
              </span>
              <span className={EYEBROW} style={{ color: tone }}>
                {copy.trigger}
              </span>
            </motion.div>
            <span className="relative mt-[1.2cqh] block overflow-hidden pb-[0.08em]">
              <motion.h3
                className="text-[clamp(2.5rem,12cqh,5.25rem)] font-extrabold leading-[1] tracking-tight text-foreground"
                initial={hub.still ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={hub.still ? { duration: 0 } : { duration: 0.75, ease: EASE, delay: 0.1 }}
              >
                {words.label}
              </motion.h3>
            </span>
          </div>
          <motion.p className="relative mt-[2.4cqh] max-w-[34rem] text-[clamp(1.0625rem,3.3cqh,1.375rem)] leading-relaxed text-foreground/80" {...enter(0.25)}>
            {words.description}
          </motion.p>
          <motion.div className="mt-[3.2cqh] border-l-2 pl-4" style={{ borderColor: mix(tone, 60) }} {...enter(0.4)}>
            <div className={EYEBROW}>{copy.firesWhen}</div>
            <div className="mt-1.5">
              <TypedLine text={words.example} tone={tone} live={hub.live} still={hub.still} />
            </div>
          </motion.div>
          {trigger.doc && (
            <motion.div className="mt-[3cqh]" {...enter(0.5)}>
              <Link
                href={trigger.doc.href}
                className="inline-flex items-center gap-1.5 text-base font-medium underline-offset-4 transition-opacity hover:underline hover:opacity-90"
                style={{ color: tone }}
              >
                {words.docLabel}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
