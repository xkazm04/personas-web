"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, type BrandKey } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { CHAT_SCRIPT } from "../../../data";
import { instrumentCopy } from "../copy";
import { DIFF_ORDINAL } from "./signal";

const ROLE_COLOR: Record<"user" | "assistant" | "diff", BrandKey> = {
  user: "cyan",
  assistant: "purple",
  diff: "emerald",
};

/**
 * The operator log beside the scope: the refinement chat as an instrument
 * log. Every entry is always laid out (constant DOM, as the healing run log
 * does); unreached entries stay transparent and hidden from assistive tech.
 * The pane follows the newest entry by scrolling itself, never the page.
 */
export default function ChatLog({ shown, still }: { shown: number; still: boolean }) {
  const c = instrumentCopy.chat;
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = ref.current;
    const entry = list?.children[Math.max(0, shown - 1)] as HTMLElement | undefined;
    if (!list || !entry) return;
    const bottom = entry.offsetTop + entry.offsetHeight - list.clientHeight + 8;
    list.scrollTo({ top: Math.max(0, shown <= 1 ? 0 : bottom), behavior: still ? "auto" : "smooth" });
  }, [shown, still]);

  return (
    <div className="flex min-h-0 flex-col rounded-lg border border-glass bg-foreground/[0.025]">
      <div className="flex items-center justify-between border-b border-glass px-3 py-1.5">
        <span className="font-mono text-sm font-semibold uppercase tracking-[0.14em] text-foreground/80">{c.log}</span>
        <span className="font-mono text-sm tabular-nums text-foreground/60">
          {String(shown).padStart(2, "0")}/{String(CHAT_SCRIPT.length).padStart(2, "0")}
        </span>
      </div>
      <ol
        ref={ref}
        aria-live="polite"
        className="relative h-[14rem] space-y-2.5 overflow-y-auto px-3 py-2.5 scrollbar-hide stage:h-auto stage:min-h-0 stage:flex-1"
      >
        {CHAT_SCRIPT.map((msg, i) => {
          const on = i < shown;
          const k = ROLE_COLOR[msg.role];
          const ordinal = DIFF_ORDINAL[i];
          return (
            <motion.li
              key={i}
              aria-hidden={!on}
              className="relative border-l-2 pl-2.5"
              style={{ borderColor: BRAND_VAR[k] }}
              initial={false}
              animate={{ opacity: on ? 1 : 0, x: on ? 0 : -6 }}
              transition={{ duration: still ? 0 : 0.3 }}
            >
              <span className="block font-mono text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: BRAND_VAR[k] }}>
                {msg.role === "diff" && ordinal !== null
                  ? `${c.roles.diff} · ${fillTemplate(c.adjust, { n: ordinal })}`
                  : c.roles[msg.role]}
              </span>
              {msg.role === "diff" ? (
                <pre className="mt-0.5 whitespace-pre-wrap font-mono text-sm leading-snug text-foreground/90">{msg.content}</pre>
              ) : (
                <p className="mt-0.5 text-sm leading-snug text-foreground/90 [@container(min-height:30rem)]:text-base">
                  {labSectionCopy.chat.messages[msg.message]}
                </p>
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
