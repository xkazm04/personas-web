"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { CircleCheck, MessageSquareQuote, TrainFront } from "lucide-react";
import { frame, useTimelineCopy } from "../shared/Frame";
import { seg } from "../shared/motion";
import { ARRIVE, H, SNAG, START, TRAIN, W, WAYPOINTS, legWindow } from "./data";
import { STALL_CLOCK } from "./Movers";

/* v3's words on the map: the request, a two-line legend, the snag's name,
 * the stall note beside its clock, each waypoint's step, and the arrival. */

const { place, fs } = frame(W, H);
const label = "font-semibold uppercase tracking-[0.12em]";
/** Where each waypoint label sits, clear of the route: [dx, dy, width, centred]. */
const ANCHOR: [number, number, number, boolean][] = [
  [-90, 20, 180, true],
  [-90, 20, 180, true],
  [16, 16, 170, false],
  [24, -12, 180, false],
];

function Waypoint({ i, text, p }: { i: number; text: string; p: MotionValue<number> }) {
  const end = legWindow(i)[1];
  const opacity = useTransform(p, (v) => 0.6 + 0.4 * seg(v, end - 0.01, end + 0.02));
  const [x, y] = WAYPOINTS[i];
  const [dx, dy, w, centred] = ANCHOR[i];
  return (
    <motion.p className={`font-medium leading-tight text-foreground ${centred ? "text-center" : "text-left"}`} style={{ ...place(x + dx, y + dy, w), ...fs(16, 13), opacity }}>
      {text}
    </motion.p>
  );
}

export default function Labels({ c, p }: { c: number; p: MotionValue<number> }) {
  const copy = useTimelineCopy();
  const v3 = copy.v3;
  const cs = v3.cases[c];
  const sc = copy.scenarios[c];
  const stalled = useTransform(p, (v) => seg(v, TRAIN[1] + 0.02, TRAIN[1] + 0.06));
  const arrived = useTransform(p, (v) => 0.35 + 0.65 * seg(v, ARRIVE, ARRIVE + 0.04));

  return (
    <>
      <div className="rounded-2xl border border-glass bg-background/80 p-4 shadow-lg backdrop-blur" style={place(16, 22, 330)}>
        <p className={`mb-2 flex items-center gap-2 text-brand-cyan ${label}`} style={fs(13, 12)}>
          <MessageSquareQuote className="h-[1.2em] w-[1.2em]" aria-hidden />
          {sc.name}
        </p>
        <p className="font-medium leading-snug text-foreground" style={fs(18, 15)}>
          {sc.trigger}
        </p>
      </div>
      <p className={`text-center text-brand-cyan ${label}`} style={{ ...place(START[0] - 70, START[1] + 30, 140), ...fs(13, 12) }}>
        {v3.start}
      </p>

      <div className="flex items-center justify-center gap-6" style={{ ...place(400, 30, 400), ...fs(15, 12) }}>
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <TrainFront className="h-[1.2em] w-[1.2em] text-brand-rose" aria-hidden />
          {v3.rails}
        </span>
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <span aria-hidden className="h-1 w-6 rounded-full bg-brand-emerald" />
          {v3.route}
        </span>
      </div>

      <div className="flex flex-col items-center justify-end" style={{ ...place(SNAG[0] - 150, SNAG[1] - 150, 300), height: `${(100 / H) * 100}%` }}>
        <p className="rounded-xl border-2 border-brand-rose/70 bg-background/85 px-3 py-1.5 text-center font-bold leading-tight text-foreground" style={fs(17, 14)}>
          {cs.snag}
        </p>
      </div>

      <motion.div style={{ ...place(STALL_CLOCK.x + 28, STALL_CLOCK.y - 22, 200), opacity: stalled }}>
        <p className={`text-brand-rose ${label}`} style={fs(14, 12)}>
          {v3.stalled}
        </p>
        <p className="font-medium leading-snug text-foreground" style={fs(16, 13)}>
          {cs.wait}
        </p>
      </motion.div>

      {cs.waypoints.map((w, i) => (
        <Waypoint key={w} i={i} text={w} p={p} />
      ))}

      <motion.div className="text-right" style={{ ...place(880, 20, 300), opacity: arrived }}>
        <p className={`flex items-center justify-end gap-2 text-brand-emerald ${label}`} style={fs(14, 12)}>
          <CircleCheck className="h-[1.2em] w-[1.2em]" aria-hidden />
          {v3.finish}
        </p>
        <p className="font-bold leading-snug text-foreground" style={fs(24, 16)}>
          {cs.result}
        </p>
      </motion.div>
    </>
  );
}
