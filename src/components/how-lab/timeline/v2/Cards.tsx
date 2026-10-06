"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { CircleCheck, Clock, MessageSquareQuote, Sparkles } from "lucide-react";
import { frame, useTimelineCopy } from "../shared/Frame";
import { seg } from "../shared/motion";
import { DONE, H, HOLE_R, HOLE_Y, PLATE, TRAY, W, holeX } from "./data";

/* v2's words, in the art's coordinates: the request, the two act labels, the
 * caption that turns from "no rule fits" into the agent's reading, the hole
 * labels engraved on the plate, and the two outcomes. */

const { place, fs } = frame(W, H);
const label = "font-semibold uppercase tracking-[0.12em]";

export default function Cards({ c, p }: { c: number; p: MotionValue<number> }) {
  const copy = useTimelineCopy();
  const v2 = copy.v2;
  const cs = v2.cases[c];
  const sc = copy.scenarios[cs.scenario];
  const actOne = useTransform(p, (v) => 1 - 0.55 * seg(v, 0.44, 0.47));
  const actTwo = useTransform(p, (v) => 0.45 + 0.55 * seg(v, 0.44, 0.47));
  const noRule = useTransform(p, (v) => seg(v, 0.15, 0.18) * (1 - seg(v, 0.44, 0.47)));
  const insight = useTransform(p, (v) => seg(v, 0.61, 0.65));
  const tray = useTransform(p, (v) => 0.4 + 0.6 * seg(v, 0.4, 0.44));
  const done = useTransform(p, (v) => 0.4 + 0.6 * seg(v, 0.86, 0.9));

  return (
    <>
      <div className="rounded-2xl border border-glass bg-background/80 p-4 shadow-lg backdrop-blur" style={place(10, 168, 290)}>
        <p className={`mb-2 flex items-center gap-2 text-brand-cyan ${label}`} style={fs(13, 12)}>
          <MessageSquareQuote className="h-[1.2em] w-[1.2em]" aria-hidden />
          {v2.request}
        </p>
        <p className="font-medium leading-snug text-foreground" style={fs(18, 15)}>
          {sc.trigger}
        </p>
      </div>

      <div className="flex justify-center gap-3" style={place(PLATE.x, 34, PLATE.w)}>
        <motion.span className={`rounded-full border border-brand-rose/50 px-3 py-1 text-brand-rose ${label}`} style={{ ...fs(14, 12), opacity: actOne }}>
          {v2.rulesPhase}
        </motion.span>
        <motion.span className={`rounded-full border border-brand-emerald/50 px-3 py-1 text-brand-emerald ${label}`} style={{ ...fs(14, 12), opacity: actTwo }}>
          {v2.agentPhase}
        </motion.span>
      </div>
      <div className="grid text-center font-semibold leading-snug" style={{ ...place(PLATE.x, 96, PLATE.w), ...fs(22, 16) }}>
        <motion.p className="col-start-1 row-start-1 text-brand-rose" style={{ opacity: noRule }}>
          {v2.rulesNote}
        </motion.p>
        <motion.p className="col-start-1 row-start-1 flex items-start justify-center gap-2 text-foreground" style={{ opacity: insight }}>
          <Sparkles className="mt-1 h-[0.95em] w-[0.95em] shrink-0 text-brand-cyan" aria-hidden />
          {cs.insight}
        </motion.p>
      </div>

      {cs.holes.map((h, i) => (
        <p key={h} className="text-center font-medium leading-tight text-foreground/90" style={{ ...place(holeX(i) - 72, HOLE_Y + HOLE_R + 8, 144), ...fs(16, 12) }}>
          {h}
        </p>
      ))}
      <p className={`text-muted-dark ${label}`} style={{ ...place(PLATE.x + 24, PLATE.y + PLATE.h + 3), ...fs(13, 12) }}>
        {v2.systems}
      </p>

      <motion.div className="p-4" style={{ ...place(TRAY.x, TRAY.y, TRAY.w), opacity: tray }}>
        <p className={`flex items-center gap-2 text-brand-rose ${label}`} style={fs(13, 12)}>
          <Clock className="h-[1.15em] w-[1.15em]" aria-hidden />
          {v2.waiting}
        </p>
        <p className="mt-2 font-bold leading-snug text-foreground" style={fs(20, 14)}>
          {cs.wait}
        </p>
      </motion.div>
      <motion.div className="p-4" style={{ ...place(DONE.x, DONE.y, DONE.w), opacity: done }}>
        <p className={`flex items-center gap-2 text-brand-emerald ${label}`} style={fs(13, 12)}>
          <CircleCheck className="h-[1.15em] w-[1.15em]" aria-hidden />
          {v2.done}
        </p>
        <p className="mt-2 font-bold leading-snug text-foreground" style={fs(23, 15)}>
          {cs.result}
        </p>
      </motion.div>
    </>
  );
}
