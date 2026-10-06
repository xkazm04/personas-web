"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { fg, fsOf } from "../shared/frame";
import { place } from "../shared/place";
import { MARKS } from "./data";
import type { MapGeo } from "./geometry";

/**
 * The words at each landmark, in one owned zone beside it - and the swap that
 * is the whole section in miniature. While she is stopped there it holds an
 * exchange: her question, then your short answer. Once you have answered, the
 * exchange is replaced by HER NOTE of it, in her own words, and that note stays
 * on the map for good. A question becomes something she carries.
 */

/** Zone height, in design units; zones above a landmark sit on its top edge. */
const ZONE_H = 96;

export default function Notes({ geo, marks, reduced }: { geo: MapGeo; marks: number[]; reduced: boolean }) {
  const { t } = useTranslation();
  const c = t.athenaLab.memory.v3;
  const kept = t.athenaPage.memory.kept;
  const fs = fsOf(geo.W);
  const at = place(geo);

  return (
    <>
      {MARKS.map((m, i) => {
        const z = geo.notes[i];
        const above = z.y < geo.stops[i + 1].y;
        const align = above ? "justify-end" : "justify-start";
        const state = marks[i];
        const pop = (on: boolean, delay = 0) => ({
          initial: false as const,
          animate: { opacity: on ? 1 : 0, y: on ? 0 : above ? 6 : -6, scale: on ? 1 : 0.94 },
          transition: reduced ? { duration: 0 } : { ...SPRING_POP, delay: on ? delay : 0 },
        });
        return (
          <div key={m.key} className="absolute" style={at({ x: z.x - z.w / 2, y: z.y, w: z.w, h: ZONE_H })}>
            {/* The exchange, while she is stopped here. */}
            <div className={`absolute inset-0 flex flex-col items-center gap-[0.4em] ${align}`} style={fs(geo.fs.note, 14)}>
              <motion.span
                className="whitespace-nowrap rounded-2xl rounded-bl-md border px-[0.8em] py-[0.35em] font-medium text-foreground"
                style={{ borderColor: tint("cyan", 55), backgroundColor: tint("cyan", 12) }}
                {...pop(state >= 1 && state < 3)}
              >
                {c.questions[m.key]}
              </motion.span>
              <motion.span
                className="ml-[3em] whitespace-nowrap rounded-2xl rounded-br-md border px-[0.8em] py-[0.35em] text-foreground"
                style={{ borderColor: fg(22), backgroundColor: fg(7) }}
                {...pop(state === 2, 0.1)}
              >
                {c.answers[m.key]}
              </motion.span>
            </div>

            {/* What she keeps of it, for good. */}
            <div className={`absolute inset-0 flex flex-col items-center ${align}`}>
              <motion.span
                className="text-balance text-center font-medium leading-snug"
                style={{ ...fs(geo.fs.note, 14), color: BRAND_VAR.cyan }}
                {...pop(state === 3, 0.25)}
              >
                {kept[m.kept]}
              </motion.span>
            </div>
          </div>
        );
      })}
    </>
  );
}
