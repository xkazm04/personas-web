"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { brandShadow } from "@/lib/brand-theme";
import { ANNOTATION, ANNOTATION_DIM, PANEL_ACTIVE, SPRING_POP } from "../../stage/athena-tokens";
import { COPY, HEARD_SENTENCE, REPLY_ROOT, REPLY_TREE } from "./data";

/**
 * Her answer — a compact reply card that lands like a stamp (spring with
 * slight rotation), echoing the heard sentence, speaking one in-character
 * line, and offering quick-reply chips labeled with real op names. Chips
 * fire on click or on their number key (the real desktop feature). The
 * canned tree is two levels deep; "hold again" re-arms the gesture.
 */

export default function ReplyCard({ onReset }: { onReset: () => void }) {
  const reduced = useReducedMotion() ?? false;
  const [nodeId, setNodeId] = useState<string>(REPLY_ROOT);
  const node = REPLY_TREE[nodeId];

  // Real feature: number keys fire the visible quick-reply chips.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number.parseInt(e.key, 10);
      const chip = REPLY_TREE[nodeId].chips[n - 1];
      if (chip) setNodeId(chip.to);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nodeId]);

  return (
    <motion.div
      className={`${PANEL_ACTIVE} w-full max-w-md px-5 py-4`}
      style={{ boxShadow: brandShadow("cyan", 40, 14) }}
      initial={reduced ? false : { opacity: 0, scale: 0.72, rotate: -2.5, y: 18 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      transition={SPRING_POP}
    >
      <p className={ANNOTATION_DIM}>
        {COPY.youSaidLabel} · &ldquo;{HEARD_SENTENCE}&rdquo;
      </p>

      <div aria-live="polite">
        <p className={`${ANNOTATION} mt-3`}>{COPY.replyLabel}</p>
        <motion.p
          key={nodeId}
          className="mt-1.5 text-base leading-relaxed text-foreground sm:text-lg"
          initial={reduced ? false : { opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={SPRING_POP}
        >
          {node.line}
        </motion.p>
      </div>

      {node.chips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {node.chips.map((chip, i) => (
            <motion.button
              key={chip.to}
              type="button"
              onClick={() => setNodeId(chip.to)}
              initial={reduced ? false : { opacity: 0, y: 10, rotate: i % 2 ? 1.5 : -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ ...SPRING_POP, delay: reduced ? 0 : 0.1 + i * 0.06 }}
              className="flex items-center gap-2 rounded-full border border-glass bg-surface/60 px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-glass-hover"
            >
              <kbd className="font-mono text-[11px] text-muted-dark">{i + 1}</kbd>
              <span>{chip.label}</span>
              <span className="font-mono text-[11px] text-brand-cyan/80">{chip.op}</span>
            </motion.button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className={`${ANNOTATION_DIM} ${node.chips.length ? "" : "invisible"}`}>
          {COPY.keyHint}
        </p>
        <button
          type="button"
          onClick={onReset}
          className={`${ANNOTATION} rounded-full border border-glass px-3 py-1 transition-colors hover:border-glass-hover`}
        >
          {COPY.resetLabel}
        </button>
      </div>
    </motion.div>
  );
}
