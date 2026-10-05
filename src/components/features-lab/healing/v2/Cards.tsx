"use client";

import { motion } from "framer-motion";
import { Check, UserRound } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CASE_COLOR, CASE_IDS, isEscalated, type CaseId } from "../shared/cases";
import { CARD_X, VIEW, rowY } from "./geometry";

const ROW_H = 84;

/** Where each beam lands: the failure, the fix it got, and how many it has caught. */
export default function Cards({
  cases,
  counts,
  forYou,
  running,
}: {
  cases: Record<CaseId, { name: string; fix: string }>;
  counts: Record<CaseId, number>;
  forYou: string;
  running: boolean;
}) {
  return (
    <>
      {CASE_IDS.map((id, i) => {
        const k = CASE_COLOR[id];
        const yours = isEscalated(id);
        return (
          <div
            key={id}
            className="absolute right-0 flex items-center gap-[0.8em] overflow-hidden rounded-[0.8em] border px-[0.9em]"
            style={{
              left: `${(CARD_X / VIEW.w) * 100}%`,
              top: `${((rowY(i) - ROW_H / 2) / VIEW.h) * 100}%`,
              height: `${(ROW_H / VIEW.h) * 100}%`,
              borderColor: tint(k, yours ? 70 : 45),
              background: `linear-gradient(90deg, ${tint(k, yours ? 20 : 13)}, color-mix(in srgb, var(--background) 70%, transparent))`,
              boxShadow: yours ? `0 0 2em ${tint(k, 25)}` : "none",
            }}
          >
            <motion.span
              key={counts[id]}
              aria-hidden
              className="absolute inset-0"
              style={{ background: tint(k, 35) }}
              initial={running ? { opacity: 0.8 } : false}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
            />
            <span className="relative min-w-0 flex-1 leading-tight">
              <span className="block font-semibold" style={{ color: BRAND_VAR[k] }}>
                {cases[id].name}
              </span>
              <span className="block text-foreground/90">{cases[id].fix}</span>
            </span>
            <span
              className="relative inline-flex shrink-0 items-center gap-[0.3em] rounded-full px-[0.6em] py-[0.15em] text-[0.85em] font-semibold tabular-nums"
              style={{ color: BRAND_VAR[yours ? "rose" : "emerald"], background: tint(yours ? "rose" : "emerald", 14) }}
            >
              {yours ? <UserRound className="h-[1em] w-[1em]" aria-hidden /> : <Check className="h-[1em] w-[1em]" aria-hidden />}
              {yours ? forYou : counts[id]}
            </span>
          </div>
        );
      })}
    </>
  );
}
