"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { frame } from "../shared/ArtBox";
import { beat } from "../shared/motion";
import { BEAT, CHASSIS, CHIPS_Y, FRAME, H, LAP, MOD, PARTS, PROMPT, RAIL, RAIL_Y, TOGGLE, W } from "./assemblyGeometry";

/* The words of V2 in the art's coordinates: the frame's labels, the sentence
 * typing in phrase by phrase, Personas' one question and your answer, the part
 * names, the switch, and the four-step rail under the machine. */

const { place, fs } = frame(W, H);
const TEXT = { amber: "text-brand-amber", cyan: "text-brand-cyan", purple: "text-brand-purple", emerald: "text-brand-emerald" } as const;
const LINE = { amber: "var(--brand-amber)", cyan: "var(--brand-cyan)", purple: "var(--brand-purple)", emerald: "var(--brand-emerald)" } as const;

function useBeat(p: MotionValue<number>, at: number, floor = 0, span = 0.05) {
  return useTransform(p, (v) => floor + (1 - floor) * beat(v, at, span));
}

function Phrase({ p, i, text }: { p: MotionValue<number>; i: number; text: string }) {
  const part = PARTS[i];
  const clipPath = useTransform(p, (v) => `inset(-20% ${(1 - beat(v, part.type, 0.065)) * 100}% -40% 0)`);
  return (
    <motion.span className="whitespace-nowrap text-center font-medium text-foreground" style={{ ...place(part.x - 126, PROMPT.y + 17, 252), ...fs(22, 15), clipPath }}>
      <span className="pb-[0.1em]" style={{ borderBottom: `3px solid ${LINE[part.tone]}` }}>{text}</span>
    </motion.span>
  );
}

function PartName({ p, i, text }: { p: MotionValue<number>; i: number; text: string }) {
  const part = PARTS[i];
  const opacity = useBeat(p, part.drop, 0.25);
  const y = useTransform(p, (v) => `calc(${-22 * (1 - beat(v, part.drop, 0.05))} * 100cqw / ${W})`);
  return (
    <motion.span className={`text-center font-bold leading-tight ${TEXT[part.tone]}`} style={{ ...place(part.x - MOD.w / 2, MOD.y + 76, MOD.w), ...fs(19, 13), opacity, y }}>
      {text}
    </motion.span>
  );
}

export default function Words({ p, loop, onSeek }: { p: MotionValue<number>; loop: MotionValue<number>; onSeek: (at: number) => void }) {
  const g = useTranslation().t.landingLab.getStarted;
  const c = g.v2;
  const question = useBeat(p, BEAT.question);
  const answer = useBeat(p, BEAT.answer);
  const tested = useBeat(p, BEAT.tested);
  const on = useBeat(p, BEAT.on, 0.45);
  const posted = useTransform([loop, p], ([v, pv]: number[]) => beat(pv, BEAT.on, 0.05) * (v > LAP.travel ? Math.min(1, (v - LAP.travel) / 0.05) : 0));
  const phrases = [c.phrases.when, c.phrases.read, c.phrases.think, c.phrases.send];
  const parts = [c.parts.when, c.parts.read, c.parts.think, c.parts.send];
  const chip = "flex items-center justify-center gap-[0.35em] rounded-full border px-[0.8em] py-[0.3em] font-semibold whitespace-nowrap";

  return (
    <>
      <span className="font-semibold text-foreground/80" style={{ ...place(FRAME.x + 24, FRAME.y + 15), ...fs(17, 12) }}>{c.machine}</span>
      <span className="text-center font-bold text-brand-cyan" style={{ ...place(W / 2 - 84, FRAME.y + 15, 168), ...fs(17, 12) }}>{c.app}</span>
      <span className="text-right text-foreground/70" style={{ ...place(W / 2 + 110, FRAME.y + 17, 380), ...fs(15, 12) }}>{g.steps.away.line}</span>

      {phrases.map((t, i) => (
        <Phrase key={PARTS[i].key} p={p} i={i} text={t} />
      ))}
      <motion.span className={`${chip} border-brand-purple/60 text-brand-purple`} style={{ ...place(752, CHIPS_Y, 206), ...fs(16, 12), opacity: question }}>
        <Sparkles className="h-[1.1em] w-[1.1em] shrink-0" aria-hidden />
        {c.question}
      </motion.span>
      <motion.span className={`${chip} border-brand-cyan/60 bg-brand-cyan/10 text-foreground`} style={{ ...place(994, CHIPS_Y, 122), ...fs(16, 12), opacity: answer }}>
        {c.answer}
      </motion.span>

      {parts.map((t, i) => (
        <PartName key={PARTS[i].key} p={p} i={i} text={t} />
      ))}
      <span className="font-bold text-brand-emerald" style={{ ...place(CHASSIS.x + 24, CHASSIS.y + 14), ...fs(17, 12) }}>{c.agent}</span>
      <motion.span className="text-right font-bold text-brand-emerald" style={{ ...place(TOGGLE.x - 64, CHASSIS.y + 14, 54), ...fs(17, 12), opacity: on }}>{c.on}</motion.span>
      <motion.span className={`${chip} border-brand-emerald/50 text-brand-emerald`} style={{ ...place(690, CHASSIS.y + CHASSIS.h + 14, 190), ...fs(16, 12), opacity: tested }}>
        <Check className="h-[1.1em] w-[1.1em] shrink-0" aria-hidden />
        {c.tested}
      </motion.span>
      <motion.span className={`${chip} border-brand-emerald/60 bg-brand-emerald/15 text-foreground`} style={{ ...place(894, CHASSIS.y + CHASSIS.h + 14, 222), ...fs(16, 12), opacity: posted }}>
        {c.posted}
      </motion.span>

      <ol className="contents">
        {RAIL.map((r, i) => (
          <RailStep key={r.key} p={p} at={r.at} n={i + 1} x={30 + i * 286} tone={r.tone} title={c.rail[r.key]} line={g.steps[r.key].line} onSeek={onSeek} />
        ))}
      </ol>
    </>
  );
}

type RailProps = { p: MotionValue<number>; at: number; n: number; x: number; tone: keyof typeof TEXT; title: string; line: string; onSeek: (at: number) => void };

/** One step of the rail; a button that plays the build to that step. */
function RailStep({ p, at, n, x, tone, title, line, onSeek }: RailProps) {
  const opacity = useBeat(p, at, 0.5);
  return (
    <motion.li className="list-none" style={{ ...place(x, RAIL_Y - 6, 280), ...fs(18, 15), opacity }}>
      <button
        type="button"
        onClick={() => onSeek(at)}
        className="block w-full rounded-xl p-[0.35em] text-left transition-colors hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
      >
        <span className={`block font-bold leading-tight ${TEXT[tone]}`} style={{ fontSize: "1.2em" }}>
          <span className="mr-[0.4em] font-mono text-[0.8em] opacity-80">{n}</span>
          {title}
        </span>
        <span className="mt-[0.2em] block leading-snug text-foreground/85">{line}</span>
      </button>
    </motion.li>
  );
}
