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
import HubControls from "../shared/HubControls";

/**
 * The words below the horizon, either side of the sun: the trigger's name and
 * what it does on the left; what fires it, the guide and the playback control
 * on the right. The middle column is left to the sun and the agent it wakes.
 */
export default function Band({ hub }: { hub: HubPlayback }) {
  const copy = useTranslation().t.orchestrationSection;
  const trigger = hub.trigger;
  const words = triggerWords(copy, trigger);
  const tone = BRAND_VAR[trigger.brand];
  const Icon = trigger.icon;
  const swap = {
    initial: hub.still ? (false as const) : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: hub.still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8, transition: { duration: 0.2 } },
    transition: hub.still ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <div
      aria-live={hub.stopped ? "polite" : "off"}
      className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_clamp(13rem,22cqw,20rem)_minmax(0,1fr)] lg:gap-[2cqw]"
    >
      <AnimatePresence mode="wait">
        <motion.div key={`${trigger.id}-name`} {...swap} className="min-w-0 lg:text-right">
          <div className="flex items-center gap-2 lg:justify-end">
            <Icon className="h-4 w-4" style={{ color: tone }} aria-hidden="true" />
            <span className={EYEBROW} style={{ color: tone }}>
              {copy.trigger} {String(hub.state.active + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="mt-1 text-[clamp(2rem,7.4cqh,3.75rem)] font-extrabold leading-[1.02] tracking-tight text-foreground">
            {words.label}
          </h3>
          <p className="mt-2 text-[clamp(1rem,2.6cqh,1.1875rem)] leading-relaxed text-foreground/80 lg:ml-auto lg:max-w-[30rem]">
            {words.description}
          </p>
        </motion.div>
      </AnimatePresence>
      <div aria-hidden="true" className="hidden lg:block" />
      <div className="flex min-w-0 flex-col items-start gap-[1.8cqh]">
        <AnimatePresence mode="wait">
          <motion.div key={`${trigger.id}-fires`} {...swap} className="border-l-2 pl-4" style={{ borderColor: mix(tone, 60) }}>
            <div className={EYEBROW}>{copy.firesWhen}</div>
            <div className="mt-1 font-mono text-[clamp(1rem,3cqh,1.375rem)] text-foreground">{words.example}</div>
            {trigger.doc && (
              <Link
                href={trigger.doc.href}
                className="mt-2 inline-flex items-center gap-1.5 text-base font-medium underline-offset-4 hover:underline"
                style={{ color: tone }}
              >
                {words.docLabel}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
        <HubControls hub={hub} tone={tone} />
      </div>
    </div>
  );
}
