"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { PASS_DAYS } from "./data";
import { notesRect, type FieldLayout } from "./layout";
import { BREATH, rectStyle } from "./parts";

/**
 * PHONES ONLY (wide screens write each sentence on its card, see ./Chip).
 *
 * What she wrote at the end of each night — the only whole sentences in the
 * frame, and the section's emotional centre.
 *
 * Each one is plain, specific and about YOU: not a summary of the day, but the
 * durable thing she now knows about how you work. They are what the marks on
 * the shelf actually are, said out loud, which is why a night that kept
 * nothing writes nothing and the row of sentences has the same gap in it that
 * the shelf does.
 *
 * Each sentence wears its night's moon, the same glyph that sits on the kept
 * thing on the ledge, so the row of moons and the row of things are one list.
 * They flow in one block, so a sentence that wraps never lands on the next.
 *
 * There is deliberately no waiting outline behind an unwritten one. An empty
 * placeholder would promise the visitor that another sentence is coming, and
 * the whole point of the quiet day is that one might not be.
 *
 * The first sentence is the one that comes back. When it lights up days later
 * it is not restated anywhere — the same words simply go warm, which is the
 * cheapest possible way to say "this exact thing, still in hand".
 */

/** Her night, as a glyph - the same moon her nights and the kept things wear. */
const MOON = "M 0 -10 A 10 10 0 0 0 0 10 A 5.5 10 0 0 1 0 -10 Z";

export default function Notes({
  layout,
  notes,
  recall,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  notes: number;
  recall: number;
  holding: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const kept = t.athenaPage.memory.kept;
  return (
    <div className="absolute flex flex-col justify-around" style={rectStyle(notesRect(layout))}>
      {PASS_DAYS.map((day, p) => {
        const shown = notes > p;
        const hot = recall === 1 && p === 0;
        const warm = recall > 0 && p === 0;
        return (
          <motion.div
            key={day}
            className="flex items-start gap-3"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 8 }}
            transition={reduced || !shown ? { duration: 0 } : SPRING_POP}
          >
            <motion.span
              className="mt-[0.3em] flex h-[1.05em] w-[1.05em] shrink-0 rounded-full duration-500 transition-[color,box-shadow]"
              style={{
                color: warm ? BRAND_VAR.cyan : tint("cyan", 60),
                boxShadow: hot ? brandShadow("cyan", 9, 70) : "none",
              }}
              initial={false}
              animate={{ opacity: reduced || !holding ? 1 : [1, 0.55, 1] }}
              transition={reduced || !holding ? { duration: 0.4 } : BREATH}
              aria-hidden="true"
            >
              <svg viewBox="-12 -12 24 24" className="h-full w-full">
                <path d={MOON} transform="rotate(-28)" fill="currentColor" />
              </svg>
            </motion.span>
            <span
              className={`min-w-0 text-lg leading-snug duration-500 transition-colors ${warm ? "" : "text-foreground"}`}
              style={warm ? { color: BRAND_VAR.cyan } : undefined}
            >
              {kept[p]}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
