"use client";

import type { RefObject } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { CircleCheck, MessageSquareQuote, TrainFront } from "lucide-react";
import { StylisedTag, frame, useTimelineCopy } from "./shared/Frame";
import { seg } from "./shared/motion";
import { ARRIVE, PHONE, TRAIN, legWindow } from "./data";
import Scene from "./Scene";

/* The phone composition: the request card and legend above a portrait map
 * (rail down the page, the agent's route bowing left through four numbered
 * stops), the steps those numbers stand for, then the result. Same story
 * clock, same reduced-motion end frame as the wide map. */

const { place } = frame(PHONE.w, PHONE.h);
const label = "text-xs font-semibold uppercase tracking-[0.12em]";
/** Left edge of the snag's name: clear of the barrier and the fallen rocks. */
const SNAG_X = PHONE.snag[0] + 58;

/** A step's light: dim until the route reaches its waypoint. */
const useLit = (p: MotionValue<number>, i: number, floor: number) => {
  const end = legWindow(i)[1];
  return useTransform(p, (v) => floor + (1 - floor) * seg(v, end - 0.01, end + 0.02));
};

function Badge({ i, p }: { i: number; p: MotionValue<number> }) {
  const opacity = useLit(p, i, 0.35);
  return (
    <motion.span
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-brand-emerald bg-background font-mono text-xs font-bold text-foreground"
      style={{ opacity }}
    >
      {i + 1}
    </motion.span>
  );
}

function Step({ i, text, p }: { i: number; text: string; p: MotionValue<number> }) {
  const opacity = useLit(p, i, 0.6);
  return (
    <motion.li className="flex items-start gap-2.5" style={{ opacity }}>
      <Badge i={i} p={p} />
      <span className="text-base font-medium leading-snug text-foreground">{text}</span>
    </motion.li>
  );
}

export default function Phone({ c, p, boxRef }: { c: number; p: MotionValue<number>; boxRef: RefObject<HTMLDivElement | null> }) {
  const v3 = useTimelineCopy().v3;
  const cs = v3.cases[c];
  const sc = useTimelineCopy().scenarios[c];
  const stalled = useTransform(p, (v) => seg(v, TRAIN[1] + 0.02, TRAIN[1] + 0.06));
  const arrived = useTransform(p, (v) => 0.35 + 0.65 * seg(v, ARRIVE, ARRIVE + 0.04));

  return (
    <div className="mx-auto flex w-full max-w-[26rem] flex-col gap-4">
      <div className="rounded-2xl border border-glass bg-background/80 p-4 shadow-lg backdrop-blur">
        <p className={`mb-2 flex items-center gap-2 text-brand-cyan ${label}`}>
          <MessageSquareQuote className="h-4 w-4" aria-hidden />
          {sc.name}
        </p>
        <p className="text-base font-medium leading-snug text-foreground">{sc.trigger}</p>
      </div>
      <div className="flex items-center justify-center gap-6 text-sm font-semibold text-foreground">
        <span className="flex items-center gap-2">
          <TrainFront className="h-4 w-4 text-brand-rose" aria-hidden />
          {v3.rails}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-1 w-6 rounded-full bg-brand-emerald" />
          {v3.route}
        </span>
      </div>

      <div ref={boxRef} className="relative w-full" style={{ aspectRatio: `${PHONE.w} / ${PHONE.h}` }}>
        <Scene key={c} g={PHONE} p={p}>
          <p className={`text-brand-cyan ${label}`} style={place(PHONE.start[0] + 30, PHONE.start[1] - 10)}>
            {v3.start}
          </p>
          <motion.div style={{ ...place(PHONE.clock.x + 24, PHONE.clock.y - 18, PHONE.w - PHONE.clock.x - 26), opacity: stalled }}>
            <p className={`text-brand-rose ${label}`}>{v3.stalled}</p>
            <p className="text-base font-medium leading-snug text-foreground">{cs.wait}</p>
          </motion.div>
          <p
            className="rounded-xl border-2 border-brand-rose/70 bg-background/85 px-2.5 py-1 text-base font-bold leading-tight text-foreground"
            style={place(SNAG_X, PHONE.snag[1] - 6, PHONE.w - SNAG_X)}
          >
            {cs.snag}
          </p>
          {PHONE.waypoints.map(([x, y], i) => (
            <div key={i} className="-translate-x-1/2 -translate-y-1/2" style={place(x, y)}>
              <Badge i={i} p={p} />
            </div>
          ))}
        </Scene>
        <StylisedTag className="bottom-0 left-0" />
      </div>

      <ol className="flex flex-col gap-2.5" aria-label={v3.route}>
        {cs.waypoints.map((w, i) => (
          <Step key={w} i={i} text={w} p={p} />
        ))}
      </ol>
      <motion.div className="rounded-2xl border border-brand-emerald/40 bg-brand-emerald/10 px-4 py-3" style={{ opacity: arrived }}>
        <p className={`flex items-center gap-2 text-brand-emerald ${label}`}>
          <CircleCheck className="h-4 w-4" aria-hidden />
          {v3.finish}
        </p>
        <p className="text-xl font-bold leading-snug text-foreground">{cs.result}</p>
      </motion.div>
    </div>
  );
}
