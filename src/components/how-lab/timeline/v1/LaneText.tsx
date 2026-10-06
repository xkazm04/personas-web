"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { CircleCheck, CircleX, GitBranch, Sparkles } from "lucide-react";
import { frame } from "../shared/Frame";
import { AGENT, RULES, seg } from "../shared/motion";
import { H, PANEL_H, PANEL_X, W, XB, XE, XS, nodeX, starts, total, type TrackTiming } from "./data";

/* One lane's words, laid over the drawing in the same coordinates: the lane
 * name, a race clock in display numerals, the step labels under the segments
 * they name, the stall stamp at the break, and the result line. */

const { place, fs } = frame(W, H);

type Props = {
  kind: "rules" | "agent";
  timing: TrackTiming;
  top: number;
  rail: number;
  t: MotionValue<number>;
  name: string;
  steps: string[];
  stamp?: string;
  badge: string;
  result: string;
};

function StepLabel({ i, timing, end, rail, t, text, tone }: { i: number; timing: TrackTiming; end: number; rail: number; t: MotionValue<number>; text: string; tone: string }) {
  const n = timing.ms.length;
  const from = i === 0 ? XS : nodeX(i - 1, n, end);
  const to = nodeX(i, n, end);
  const s = starts(timing)[i];
  const opacity = useTransform(t, (v) => 0.6 + 0.4 * seg(v, s, s + 120));
  return (
    <motion.p className={`text-center font-medium leading-snug ${tone}`} style={{ ...place(from + 6, rail + 20, to - from - 12), ...fs(16, 14), opacity }}>
      {text}
    </motion.p>
  );
}

export default function LaneText({ kind, timing, top, rail, t, name, steps, stamp, badge, result }: Props) {
  const rules = kind === "rules";
  const end = rules ? XB : XE;
  const done = total(timing);
  const color = rules ? RULES : AGENT;
  const clock = useTransform(t, (v) => `${(Math.min(Math.max(v, 0), done) / 1000).toFixed(1)}s`);
  const landed = useTransform(t, (v) => seg(v, done, done + 260));
  const resultIn = useTransform(t, (v) => seg(v, done + 150, done + 500));
  const stampScale = useTransform(landed, (l) => 1.35 - 0.35 * l);
  const Icon = rules ? GitBranch : Sparkles;
  const End = rules ? CircleX : CircleCheck;

  return (
    <>
      <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.12em]" style={{ ...place(PANEL_X + 24, top + 20), ...fs(17, 13), color }}>
        <Icon className="h-[1.1em] w-[1.1em]" aria-hidden />
        {name}
      </div>
      <div className="flex items-baseline justify-end gap-3" style={place(XE - 330, top + 12, 300)}>
        <motion.span className="rounded-full border px-3 py-0.5 font-semibold uppercase tracking-[0.1em]" style={{ ...fs(14, 12), color, borderColor: color, opacity: landed }}>
          {badge}
        </motion.span>
        <motion.span className="font-mono font-bold tabular-nums text-foreground" style={fs(36, 20)}>
          {clock}
        </motion.span>
      </div>

      {steps.map((text, i) => {
        const st = timing.status[i];
        const tone = rules && st === "error" ? "text-brand-rose" : rules && st === "warn" ? "text-brand-amber" : "text-foreground/90";
        return <StepLabel key={i} i={i} timing={timing} end={end} rail={rail} t={t} text={text} tone={tone} />;
      })}

      {stamp && (
        <motion.div className="flex justify-center" style={{ ...place(XB + 40, rail + 22, XE - XB - 30), opacity: landed }}>
          <motion.span className="-rotate-6 whitespace-nowrap rounded-md border-2 px-3 py-1 font-black uppercase tracking-[0.1em]" style={{ ...fs(20, 13), color: RULES, borderColor: RULES, scale: stampScale }}>
            {stamp}
          </motion.span>
        </motion.div>
      )}

      <motion.p className="flex items-center gap-2 font-medium text-foreground" style={{ ...place(XS - 4, top + PANEL_H - 48, XE - XS), ...fs(18, 15), opacity: resultIn }}>
        <End className="h-[1.15em] w-[1.15em] shrink-0" style={{ color: rules ? RULES : AGENT }} aria-hidden />
        {result}
      </motion.p>
    </>
  );
}
