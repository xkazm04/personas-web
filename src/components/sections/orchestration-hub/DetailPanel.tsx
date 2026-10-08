"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Bot } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { EYEBROW } from "@/lib/typography";
import { triggerWords } from "@/components/sections/orchestration-hub/data";
import TriggerScene from "./shared/TriggerScene";
import { mix } from "./shared/scene-kit";
import type { HubPlayback } from "./shared/useHubPlayback";
import { orchestrationSectionCopy } from "@/i18n/pending/orchestrationSection";
import { landingSectionsCopy } from "@/i18n/pending/landingSections";

/**
 * The selected trigger, given the room the live panel never had: its own
 * vignette acting out the moment it fires, the name at display size, the
 * description, then the two facts that matter - what fires it and which agent
 * wakes - and the guide link. Polite live region only while the visitor drives.
 */
export default function DetailPanel({ hub }: { hub: HubPlayback }) {
  const copy = orchestrationSectionCopy;
  const trigger = hub.trigger;
  const words = triggerWords(copy, trigger);
  const tone = BRAND_VAR[trigger.brand];
  const Icon = trigger.icon;
  const swap = hub.still ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      aria-live={hub.stopped ? "polite" : "off"}
      className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-glass-hover p-[clamp(1.25rem,3.4cqh,2.25rem)] stage:min-h-0 stage:flex-1 stage:max-h-[80cqh]"
      style={{
        background: `radial-gradient(110% 60% at 90% 0%, ${mix(tone, 16)}, transparent 62%), color-mix(in srgb, var(--background) 72%, transparent)`,
        boxShadow: `0 30px 80px -40px ${mix(tone, 45)}, inset 0 1px 0 rgba(var(--surface-overlay), 0.07)`,
        transition: "box-shadow 600ms",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={trigger.id}
          className="flex h-full flex-col"
          initial={hub.still ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={hub.still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.22 } }}
          transition={swap}
        >
          <div
            className="relative flex h-[30cqh] min-h-[7.5rem] items-center justify-center overflow-hidden rounded-2xl border"
            style={{
              borderColor: mix(tone, 22),
              background: `radial-gradient(70% 90% at 50% 100%, ${mix(tone, 18)}, transparent 70%), rgba(var(--surface-overlay), 0.02)`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage: "radial-gradient(rgba(var(--surface-overlay), 0.12) 1px, transparent 1px)",
                backgroundSize: "14px 14px",
                maskImage: "radial-gradient(closest-side, black, transparent)",
              }}
            />
            <TriggerScene id={trigger.id} run={hub.live} tone={tone} className="relative h-[92%] w-auto" />
          </div>

          <div className="mt-[2.6cqh] flex items-center gap-2.5">
            <Icon className="h-4 w-4" style={{ color: tone }} aria-hidden="true" />
            <span className={EYEBROW} style={{ color: tone }}>
              {copy.trigger} {String(hub.state.active + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="mt-1 text-[clamp(1.75rem,6.4cqh,3.25rem)] font-bold leading-[1.05] tracking-tight text-foreground">
            {words.label}
          </h3>
          <p className="mt-[1.4cqh] text-[clamp(1rem,2.9cqh,1.25rem)] leading-relaxed text-foreground/80">{words.description}</p>

          <div aria-hidden="true" className="min-h-[1.8cqh] flex-1" />
          <dl className="grid grid-cols-2 gap-5 border-t border-glass-hover pt-[2.2cqh]">
            <div className="min-w-0">
              <dt className={EYEBROW}>{copy.firesWhen}</dt>
              <dd className="mt-1.5 font-mono text-[clamp(0.9375rem,2.5cqh,1.125rem)] text-foreground">{words.example}</dd>
            </div>
            <div className="min-w-0">
              <dt className={EYEBROW}>{landingSectionsCopy.hub.wakes}</dt>
              <dd className="mt-1.5 flex items-center gap-2 text-[clamp(0.9375rem,2.5cqh,1.125rem)] font-semibold text-foreground">
                <Bot className="h-4 w-4 shrink-0" style={{ color: BRAND_VAR.cyan }} aria-hidden="true" />
                {words.persona}
              </dd>
            </div>
          </dl>
          {trigger.doc && (
            <Link
              href={trigger.doc.href}
              className="mt-[2cqh] inline-flex w-fit items-center gap-1.5 text-base font-medium transition-opacity hover:opacity-80"
              style={{ color: tone }}
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>{words.docLabel}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
