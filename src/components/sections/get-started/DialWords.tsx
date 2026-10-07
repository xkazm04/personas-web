"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Lock } from "lucide-react";
import type { CSSProperties } from "react";
import { frame } from "./shared/ArtBox";
import { beat } from "./shared/motion";
import { C, DAY, H, R, RUNS, W, clock, degOf, polar } from "./dialGeometry";
import { landingSectionsCopy } from "@/i18n/pending/landingSections";

/* The words of V3 in the dial's coordinates: the names of your day around the
 * band, the clock and day in the middle, your few minutes on the left, and the
 * agent's runs on the right (each one lights as the hand reaches it). */

const { place, fs } = frame(W, H);
const centred = (x: number, y: number, w: number): CSSProperties => ({ ...place(x - w / 2, y, w), transform: "translateY(-50%)", textAlign: "center" });
const SETUP_TIMES = ["09:00", "09:06", "09:14"] as const;

function SetupStep({ p, i, text }: { p: MotionValue<number>; i: number; text: string }) {
  const opacity = useTransform(p, (v) => 0.5 + 0.5 * beat(v, i * 0.3, 0.12));
  return (
    <motion.li className="flex items-baseline gap-[0.6em]" style={{ opacity }}>
      <span className="font-mono text-[0.85em] text-brand-cyan">{SETUP_TIMES[i]}</span>
      <span className="font-semibold text-foreground">{text}</span>
    </motion.li>
  );
}

export default function DialWords({ p, hour, day, passed }: { p: MotionValue<number>; hour: MotionValue<number>; day: number; passed: number }) {
  const g = landingSectionsCopy.getStarted;
  const c = g.v3;
  const time = useTransform(hour, clock);
  const setup = [c.setup.install, c.setup.describe, c.setup.connect];

  return (
    <>
      {DAY.map((d) => {
        const mid = d.from + ((((d.to - d.from) % 24) + 24) % 24) / 2;
        const [x, y] = polar(degOf(mid), R.label);
        return (
          <span key={d.key} className={`font-semibold ${d.night ? "text-brand-purple" : "text-foreground/80"}`} style={{ ...centred(x, y, 120), ...fs(16, 12) }}>
            {c.dayParts[d.key]}
          </span>
        );
      })}

      <div className="flex flex-col items-center" style={{ ...centred(C.x, C.y - 6, 220) }}>
        <motion.span className="font-mono font-bold tabular-nums leading-none text-foreground" style={fs(54, 28)}>{time}</motion.span>
        <span className="mt-[0.3em] font-semibold text-foreground/80" style={fs(18, 13)}>{c.day.replace("{n}", String(day))}</span>
        <span className="mt-[0.4em] flex items-center gap-[0.35em] text-brand-emerald" style={fs(15, 12)}>
          <Lock className="h-[1em] w-[1em]" aria-hidden />
          {c.onYourPc}
        </span>
      </div>
      <span className="font-bold text-brand-emerald" style={{ ...centred(C.x, C.y + R.agent - 26, 160), ...fs(15, 12) }}>
        {c.agent}
      </span>

      <div style={{ ...place(24, 92, 292), ...fs(18, 15) }}>
        <p className="font-bold leading-tight text-brand-cyan" style={{ fontSize: "1.3em" }}>{c.yours}</p>
        <p className="mt-[0.15em] text-foreground/80">{c.yoursLine}</p>
        <ol className="mt-[0.8em] space-y-[0.45em]">
          {setup.map((t, i) => (
            <SetupStep key={t} p={p} i={i} text={t} />
          ))}
        </ol>
      </div>

      <div style={{ ...place(898, 92, 282), ...fs(17, 15) }}>
        <p className="font-bold leading-tight text-brand-emerald" style={{ fontSize: "1.38em" }}>{c.its}</p>
        <p className="mt-[0.15em] text-foreground/80">{c.itsLine}</p>
        <ol className="mt-[0.7em] space-y-[0.5em]">
          {RUNS.map((r, i) => {
            const done = i < passed;
            const latest = i === passed - 1;
            return (
              <li
                key={r.key}
                className={`rounded-xl border px-[0.6em] py-[0.35em] transition-[opacity,background-color,border-color] duration-300 ${latest ? "border-brand-emerald/60 bg-brand-emerald/10" : "border-transparent"}`}
                style={{ opacity: done ? 1 : 0.6 }}
              >
                <span className="flex items-center gap-[0.5em] text-[0.85em]">
                  <span className="font-mono font-semibold text-foreground">{r.time}</span>
                  <span className={`rounded-full border px-[0.5em] font-semibold ${r.trigger === "schedule" ? "border-brand-amber/50 text-brand-amber" : "border-brand-cyan/50 text-brand-cyan"}`}>
                    {c.triggers[r.trigger]}
                  </span>
                </span>
                <span className="block leading-snug text-foreground/90">{c.runs[r.key]}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
