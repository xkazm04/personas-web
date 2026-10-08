"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { frame } from "./shared/Stage";
import { AGENTS, FLEET, H, LINES, N, PRINT, PRINTER, TAPE, W, cableEnd, fleetY, stepOf } from "./log";
import { observeSectionCopy } from "@/i18n/pending/observeSection";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

/* The left half of V3: the fleet (each agent a button that isolates its lines
 * on the record), a cable from each agent into the printer, a light that runs
 * down the cable of the agent whose run prints next, and the printer itself. */

const { place, fs } = frame(W, H);
const FG = "var(--foreground)";
const cable = (i: number) => {
  const y = fleetY(i) + FLEET.h / 2;
  const e = cableEnd(i);
  return `M${FLEET.w + 4} ${y} C${FLEET.w + 70} ${y}, ${e.x - 70} ${e.y}, ${e.x} ${e.y}`;
};

function Cable({ i, clock, dim }: { i: number; clock: MotionValue<number>; dim: boolean }) {
  const progress = useTransform(clock, (s) => {
    const { whole, frac } = stepOf(s);
    return LINES[(whole + 1) % N].agent === i && frac >= PRINT ? (frac - PRINT) / (1 - PRINT) : -1;
  });
  const offset = useTransform(progress, (p) => 0.14 - Math.max(0, p));
  const opacity = useTransform(progress, (p) => (p < 0 ? 0 : 1));
  const c = BRAND_VAR[AGENTS[i].brand];
  return (
    <g style={{ opacity: dim ? 0.2 : 1, transition: "opacity 300ms" }}>
      <path d={cable(i)} stroke={c} strokeOpacity={0.35} strokeWidth={2} />
      <motion.path d={cable(i)} pathLength={1} stroke={c} strokeWidth={4} strokeLinecap="round" strokeDasharray="0.14 2" style={{ strokeDashoffset: offset, opacity }} />
      <circle cx={FLEET.w + 4} cy={fleetY(i) + FLEET.h / 2} r={4} fill={c} />
    </g>
  );
}

function AgentButton({ i, clock, active, onPick }: { i: number; clock: MotionValue<number>; active: boolean; onPick: () => void }) {
  const name = observeSectionCopy.agents[AGENTS[i].id];
  const c = BRAND_VAR[AGENTS[i].brand];
  const glow = useTransform(clock, (s) => {
    const { whole, frac } = stepOf(s);
    return LINES[whole % N].agent === i ? Math.max(0, 1 - frac / 0.7) : 0;
  });
  const shadow = useTransform(glow, (g) => `0 0 ${Math.round(30 * g)}px color-mix(in srgb, ${c} ${Math.round(45 * g)}%, transparent)`);
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onPick}
      className={`flex cursor-pointer items-center gap-[0.6em] rounded-2xl border px-[0.9em] text-left font-semibold text-foreground backdrop-blur-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${active ? "" : "border-glass bg-foreground/[0.03] hover:border-glass-hover"}`}
      style={{
        ...place(FLEET.x, fleetY(i), FLEET.w, FLEET.h),
        ...fs(17, 15),
        boxShadow: shadow,
        ...(active ? { borderColor: c, backgroundColor: `color-mix(in srgb, ${c} 12%, transparent)` } : {}),
      }}
    >
      <span className="h-[0.7em] w-[0.7em] shrink-0 rounded-full" style={{ backgroundColor: c }} />
      <span className="whitespace-nowrap">{name}</span>
    </motion.button>
  );
}

export default function FleetCables({ clock, agent, onPick, label }: { clock: MotionValue<number>; agent: number | null; onPick: (i: number | null) => void; label: string }) {
  const c = featuresSectionsCopy.observe.v3;
  // The slot flares and the LED lights while a line is coming out.
  const printing = useTransform(clock, (s) => {
    const { frac } = stepOf(s);
    return frac < PRINT ? Math.sin((frac / PRINT) * Math.PI) : 0;
  });
  const slotOp = useTransform(printing, (v) => 0.45 + 0.55 * v);
  const ledOp = useTransform(printing, (v) => 0.35 + 0.65 * v);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label} fill="none">
        <defs>
          <linearGradient id="ob3-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={FG} stopOpacity={0.16} />
            <stop offset="1" stopColor={FG} stopOpacity={0.05} />
          </linearGradient>
          <radialGradient id="ob3-slot" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={BRAND_VAR.emerald} stopOpacity={0.5} />
            <stop offset="1" stopColor={BRAND_VAR.emerald} stopOpacity={0} />
          </radialGradient>
        </defs>
        {AGENTS.map((a, i) => (
          <Cable key={a.id} i={i} clock={clock} dim={agent !== null && agent !== i} />
        ))}
        <motion.ellipse cx={TAPE.x + TAPE.w / 2} cy={PRINTER.y + 10} rx={TAPE.w * 0.66} ry={26} fill="url(#ob3-slot)" style={{ opacity: slotOp }} />
        <rect x={PRINTER.x} y={PRINTER.y} width={PRINTER.w} height={PRINTER.h} rx={18} fill="var(--background)" />
        <rect x={PRINTER.x} y={PRINTER.y} width={PRINTER.w} height={PRINTER.h} rx={18} fill="url(#ob3-body)" stroke={FG} strokeOpacity={0.2} />
        <line x1={PRINTER.x + 20} x2={PRINTER.x + PRINTER.w - 20} y1={PRINTER.y + 1} y2={PRINTER.y + 1} stroke={FG} strokeOpacity={0.35} />
        {[0, 1, 2].map((k) => (
          <line key={k} x1={PRINTER.x + 26} x2={PRINTER.x + 70} y1={PRINTER.y + 42 + k * 9} y2={PRINTER.y + 42 + k * 9} stroke={FG} strokeOpacity={0.18} strokeWidth={2} strokeLinecap="round" />
        ))}
        <rect x={TAPE.x - 10} y={PRINTER.y + 8} width={TAPE.w + 20} height={7} rx={3.5} fill="var(--background)" stroke={BRAND_VAR.emerald} strokeOpacity={0.7} />
        <motion.circle cx={PRINTER.x + PRINTER.w - 34} cy={PRINTER.y + 50} r={14} fill={BRAND_VAR.emerald} fillOpacity={0.25} style={{ opacity: ledOp }} />
        <circle cx={PRINTER.x + PRINTER.w - 34} cy={PRINTER.y + 50} r={6} fill={BRAND_VAR.emerald} />
      </svg>
      <span className="font-mono uppercase tracking-[0.2em] text-foreground/70" style={{ ...place(PRINTER.x, PRINTER.y + 36, PRINTER.w), ...fs(14, 12), textAlign: "center" }}>
        {c.printer}
      </span>

      <button
        type="button"
        aria-pressed={agent === null}
        onClick={() => onPick(null)}
        className={`cursor-pointer rounded-full border px-[0.9em] font-mono uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${agent === null ? "border-brand-cyan/60 bg-brand-cyan/10 text-brand-cyan" : "border-glass text-foreground/75 hover:text-foreground"}`}
        style={{ ...place(FLEET.x, 18, undefined, 40), ...fs(14, 12) }}
      >
        {c.allAgents}
      </button>
      {AGENTS.map((a, i) => (
        <AgentButton key={a.id} i={i} clock={clock} active={agent === i} onPick={() => onPick(agent === i ? null : i)} />
      ))}
    </>
  );
}
