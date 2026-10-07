"use client";

import { motion } from "framer-motion";
import { Brain, Fingerprint, MessageSquareReply, SlidersHorizontal, UserRound } from "lucide-react";
import { CHANNELS, type TwinFrame } from "./twinData";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

const A = "var(--brand-amber)";
const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

/**
 * The source side: you, your one intent, and the twin that will speak as you
 * - drawn as your avatar with a dashed echo of itself - its three traits
 * lighting as it works, and the memory it recalls and the replies it tracks.
 */
export default function TwinSource({ frame, run }: { frame: TwinFrame; run: boolean }) {
  const copy = featuresSectionsCopy.plugins.twin;
  const traits = [
    { key: "identity", label: copy.traits.identity, icon: UserRound, on: frame.recalled },
    { key: "tone", label: copy.traits.tone, icon: SlidersHorizontal, on: frame.toned },
    { key: "memory", label: copy.traits.memory, icon: Brain, on: frame.recalled },
  ] as const;
  const t = (on: boolean) => ({ initial: false as const, animate: { opacity: on ? 1 : 0, y: on ? 0 : 6 }, transition: { duration: run ? 0.4 : 0 } });

  return (
    <div className="grid h-full min-h-0 grid-rows-[112px_1fr_112px] gap-3">
      <div className="flex flex-col gap-2 rounded-2xl border border-foreground/[0.1] bg-foreground/[0.03] px-3.5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full text-[14px] font-bold text-background" style={{ background: A }}>
            {copy.sender.charAt(0)}
          </span>
          <span className="text-[15px] font-semibold text-foreground">{copy.you}</span>
        </div>
        <motion.p {...t(frame.intent)} className="rounded-xl rounded-tl-sm px-3 py-1.5 text-[15px] leading-snug text-foreground" style={{ background: mix(A, 14) }}>
          {copy.intent}
        </motion.p>
      </div>

      <div className="flex items-center">
        <div
          className="relative w-full rounded-2xl border px-3.5 py-3 transition-[border-color,box-shadow] duration-500"
          style={{
            borderColor: frame.recalled ? mix(A, 65) : mix(A, 28),
            background: `linear-gradient(150deg, ${mix(A, 16)}, color-mix(in srgb, var(--background) 92%, transparent) 80%)`,
            boxShadow: frame.recalled ? `0 0 34px -6px ${mix(A, 50)}` : undefined,
          }}
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="relative h-10 w-10 shrink-0" aria-hidden="true">
              <motion.span
                className="absolute inset-0 translate-x-1.5 -translate-y-1 rounded-full border-2 border-dashed"
                style={{ borderColor: A }}
                animate={run ? { opacity: [0.45, 1, 0.45] } : { opacity: 0.8 }}
                transition={run ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-full" style={{ background: mix(A, 24) }}>
                <Fingerprint className="h-5 w-5" style={{ color: A }} />
              </span>
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[16px] font-semibold text-foreground">{copy.name}</span>
              <span className="block font-mono text-[13px]" style={{ color: A }}>{copy.speaksAs}</span>
            </span>
          </div>
          <ul className="space-y-1">
            {traits.map(({ key, label, icon: Icon, on }) => (
              <li key={key} className="flex items-center gap-2 text-[14px] transition-colors duration-500" style={{ color: on ? "var(--foreground)" : "color-mix(in srgb, var(--foreground) 65%, transparent)" }}>
                <Icon className="h-4 w-4 shrink-0 transition-colors duration-500" style={{ color: on ? A : mix(A, 45) }} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className="absolute -right-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full" style={{ background: A, boxShadow: `0 0 10px ${A}` }} />
        </div>
      </div>

      <div className="flex flex-col justify-center gap-2 rounded-2xl border px-3.5 py-2.5" style={{ borderColor: mix(A, 22), background: mix(A, 4) }}>
        <motion.div {...t(frame.recalled)} className="leading-snug">
          <span className="block font-mono text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: A }}>{copy.recalled}</span>
          <span className="block text-[14px] text-foreground/85">{copy.recallFact}</span>
        </motion.div>
        <div className="flex items-center gap-2 border-t border-foreground/[0.08] pt-2 text-[14px] text-foreground/75">
          <MessageSquareReply className="h-4 w-4" style={{ color: A }} aria-hidden="true" />
          {copy.tracked}
          <span className="ml-auto font-mono text-[15px] font-semibold tabular-nums" style={{ color: A }}>{frame.replies}/{CHANNELS.length}</span>
        </div>
      </div>
    </div>
  );
}
