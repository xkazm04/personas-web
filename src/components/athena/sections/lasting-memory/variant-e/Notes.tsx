"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { KEPT } from "./copy";
import { PASS_DAYS } from "./data";
import { noteRect, type FieldLayout } from "./layout";
import { BREATH, rectStyle } from "./parts";

/**
 * What she wrote at the end of each night — the only whole sentences in the
 * frame, and the section's emotional centre.
 *
 * Each one is plain, specific and about YOU: not a summary of the day, but the
 * durable thing she now knows about how you work. They are what the marks on
 * the shelf actually are, said out loud, which is why a night that kept
 * nothing writes nothing and the row of sentences has the same gap in it that
 * the shelf does.
 *
 * There is deliberately no waiting outline behind an unwritten one. An empty
 * placeholder would promise the visitor that another sentence is coming, and
 * the whole point of the quiet day is that one might not be.
 *
 * The first sentence is the one that comes back. When it lights up days later
 * it is not restated anywhere — the same words simply go warm, which is the
 * cheapest possible way to say "this exact thing, still in hand".
 */

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
  return (
    <>
      {PASS_DAYS.map((day, p) => {
        const shown = notes > p;
        const hot = recall === 1 && p === 0;
        const warm = recall > 0 && p === 0;
        return (
          <motion.div
            key={day}
            className="absolute flex items-start gap-2.5"
            style={rectStyle(noteRect(layout, p, day))}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 8 }}
            transition={reduced || !shown ? { duration: 0 } : SPRING_POP}
          >
            <motion.span
              className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full duration-500 transition-[background-color,box-shadow]"
              style={{
                backgroundColor: warm ? BRAND_VAR.cyan : tint("cyan", 50),
                boxShadow: hot ? brandShadow("cyan", 9, 70) : "none",
              }}
              initial={false}
              animate={{ opacity: reduced || !holding ? 1 : [1, 0.55, 1] }}
              transition={reduced || !holding ? { duration: 0.4 } : BREATH}
              aria-hidden="true"
            />
            <span
              className={`min-w-0 leading-snug duration-500 transition-colors ${
                // A sentence sitting under its own day has only a column's
                // width to do it in; a stacked one has the whole field.
                layout.notesMode === "columns" ? "text-base" : "text-base sm:text-lg"
              } ${warm ? "" : "text-foreground"}`}
              style={warm ? { color: BRAND_VAR.cyan } : undefined}
            >
              {KEPT[p]}
            </span>
          </motion.div>
        );
      })}
    </>
  );
}
