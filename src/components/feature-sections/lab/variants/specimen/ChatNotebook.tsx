"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { labSectionCopy } from "@/i18n/pending/labSection";
import type { ChatMsg } from "../../types";
import { specimenCopy } from "./copy";

/*
 * The field notebook beside the lens: numbered observations. Your requests
 * are handwritten field notes, the lab assistant answers in print, and each
 * applied diff is entered as a mutation tag (the config text, verbatim).
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Mutation number of each entry (1-based count of diffs up to it). */
function mutationNumbers(entries: readonly ChatMsg[]): number[] {
  return entries.reduce<number[]>((acc, m) => [...acc, (acc[acc.length - 1] ?? 0) + (m.role === "diff" ? 1 : 0)], []);
}

export default function ChatNotebook({ entries, still }: { entries: readonly ChatMsg[]; still: boolean }) {
  const words = labSectionCopy.chat;
  const copy = specimenCopy.chat;
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: still ? "auto" : "smooth" });
  }, [entries.length, still]);

  const mutationNo = mutationNumbers(entries);
  return (
    <ol ref={ref} className="h-full space-y-3 overflow-y-auto px-5 py-4 scrollbar-hide stage:py-3">
      {entries.map((msg, i) => {
        const enter = still ? false : { opacity: 0, y: 8 };
        if (msg.role === "diff") {
          return (
            <motion.li
              key={i}
              initial={enter}
              animate={{ opacity: 1, y: 0 }}
              className="relative ml-8 rounded-md border border-dashed px-3 py-2"
              style={{ borderColor: tint("emerald", 60), background: tint("emerald", 8) }}
            >
              <span
                aria-hidden
                className="absolute -left-[0.4rem] top-3 h-3 w-3 rounded-full border-2 bg-background"
                style={{ borderColor: BRAND_VAR.emerald }}
              />
              <span className="font-mono text-sm uppercase tracking-[0.14em]" style={{ color: BRAND_VAR.emerald }}>
                {fillTemplate(copy.mutation, { n: mutationNo[i] })} · {words.appliedDiff}
              </span>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90">{msg.content}</pre>
            </motion.li>
          );
        }
        const isUser = msg.role === "user";
        return (
          <motion.li key={i} initial={enter} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <span className="w-5 shrink-0 pt-0.5 text-right font-mono text-sm tabular-nums text-foreground/60">{pad(i + 1)}</span>
            <div className="min-w-0 flex-1 border-b border-dashed border-glass pb-2">
              <span
                className="font-mono text-sm uppercase tracking-[0.14em]"
                style={{ color: isUser ? BRAND_VAR.cyan : BRAND_VAR.purple }}
              >
                {isUser ? copy.you : copy.assistant}
              </span>
              <p className={`mt-0.5 text-base leading-relaxed ${isUser ? "font-serif italic text-foreground" : "text-foreground/90"}`}>
                {words.messages[msg.message]}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
