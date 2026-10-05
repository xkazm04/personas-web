"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { StylisedTag, frame } from "../shared/Stage";
import { beat } from "../shared/motion";
import { AGENTS, AXIS_Y, CHROME_H, DECK, FOOT_Y, H, LANE, METRICS, NAME_X, TOTALS_X, TRACK, TYPE_META, W, latest, tally } from "./data";

/* The words of V1 in the deck's coordinates: chrome, the four headline
 * metrics (count up on arrival), the time axis, each lane's name with its
 * latest event, its run count and spend (both tick as spans cross "now"). */

const { place, fs } = frame(W, H);
const STEP = (TRACK.x1 - TRACK.x0) / 3;
const MET = [
  { key: "successRate", to: 96.2, fmt: (v: number) => `${v.toFixed(1)}%`, brand: "emerald", trend: "+2.1%" },
  { key: "avgDuration", to: 3.4, fmt: (v: number) => `${v.toFixed(1)}s`, brand: "cyan", trend: "-0.8s" },
  { key: "avgCost", to: 0.14, fmt: (v: number) => `$${v.toFixed(2)}`, brand: "amber", trend: "-12%" },
  { key: "activeAgents", to: 12, fmt: (v: number) => `${Math.round(v)}`, brand: "purple", trend: "+3" },
] as const;

function Metric({ i, p }: { i: number; p: MotionValue<number> }) {
  const copy = useTranslation().t.observeSection.metrics;
  const m = MET[i];
  const text = useTransform(p, (v) => m.fmt(m.to * beat(v, 0.15 + i * 0.06, 0.45)));
  const cw = DECK.w / 4;
  return (
    <div className="flex flex-col items-center justify-center text-center" style={place(DECK.x + i * cw, METRICS.y, cw, METRICS.h)}>
      <motion.span className="font-mono font-bold tabular-nums leading-none" style={{ ...fs(34, 22), color: BRAND_VAR[m.brand] }}>
        {text}
      </motion.span>
      <span className="mt-[0.35em] font-medium text-foreground/80" style={fs(15, 13)}>{copy[m.key]}</span>
      <span className="font-mono text-brand-emerald" style={fs(13, 12)}>{m.trend}</span>
    </div>
  );
}

function LaneWords({ lane, lap, clock }: { lane: number; lap: MotionValue<number>; clock: MotionValue<number> }) {
  const o = useTranslation().t.observeSection;
  const failed = useTranslation().t.featuresLab.observe.v1.failed;
  const a = AGENTS[lane];
  const short = (l: number) => {
    const s = latest(lane, l).span;
    if (!s) return o.idle;
    return s.type === "execution.failed" ? failed : o.eventShort[s.type];
  };
  const word = useTransform(lap, short);
  const wordColor = useTransform(lap, (l) => {
    const s = latest(lane, l).span;
    return s ? BRAND_VAR[TYPE_META[s.type].brand] : "var(--muted-dark)";
  });
  const count = useTransform(clock, (t) => String(a.base + tally(lane, t).count));
  const cost = useTransform(clock, (t) => `$${(a.baseCost + tally(lane, t).cost).toFixed(2)}`);
  const y = LANE.y0 + lane * LANE.h;
  return (
    <>
      <div className="flex flex-col justify-center leading-tight" style={place(NAME_X, y, TRACK.x0 - NAME_X - 10, LANE.h)}>
        <span className="flex items-center gap-[0.45em] font-semibold text-foreground" style={fs(16, 13)}>
          <span className="h-[0.55em] w-[0.55em] shrink-0 rounded-full" style={{ backgroundColor: BRAND_VAR[a.brand] }} />
          <span className="whitespace-nowrap">{o.agents[a.id]}</span>
        </span>
        <motion.span className="pl-[1.2em] font-mono uppercase tracking-wider" style={{ ...fs(13, 12), color: wordColor }}>
          {word}
        </motion.span>
      </div>
      <div className="flex flex-col items-end justify-center font-mono leading-tight tabular-nums" style={place(TOTALS_X, y, DECK.x + DECK.w - TOTALS_X - 16, LANE.h)}>
        <motion.span className="font-semibold text-foreground" style={fs(16, 13)}>{count}</motion.span>
        <motion.span className="text-foreground/70" style={fs(14, 12)}>{cost}</motion.span>
      </div>
    </>
  );
}

export default function DeckWords({ clock, lap, p, still, filter, filterName, onClear }: {
  clock: MotionValue<number>;
  lap: MotionValue<number>;
  p: MotionValue<number>;
  still: boolean;
  filter: string | null;
  filterName: string | null;
  onClear: () => void;
}) {
  const o = useTranslation().t.observeSection;
  const c = useTranslation().t.featuresLab.observe.v1;
  return (
    <>
      <div className="flex items-center gap-[0.8em] px-[1.2em]" style={{ ...place(DECK.x, 0, DECK.w, CHROME_H), ...fs(14, 12) }}>
        <span className="flex gap-[0.4em]" aria-hidden>
          {(["rose", "amber", "emerald"] as const).map((k) => (
            <span key={k} className="h-[0.7em] w-[0.7em] rounded-full" style={{ backgroundColor: BRAND_VAR[k], opacity: 0.75 }} />
          ))}
        </span>
        <span className="font-mono text-foreground/80">observability-deck</span>
        <span className="flex items-center gap-[0.4em] rounded-full border border-brand-emerald/40 px-[0.6em] font-mono text-brand-emerald">
          <span className={`h-[0.5em] w-[0.5em] rounded-full bg-brand-emerald ${still ? "" : "animate-pulse"}`} />
          {still ? o.status.snapshot : o.status.streaming}
        </span>
        {filterName && <span className="font-mono text-foreground/80">{c.filtered.replace("{name}", filterName)}</span>}
        <StylisedTag className="ml-auto" style={fs(12, 12)} />
      </div>

      {MET.map((m, i) => (
        <Metric key={m.key} i={i} p={p} />
      ))}

      {[3, 2, 1].map((k) => (
        <span key={k} className="font-mono text-foreground/70" style={{ ...place(TRACK.x1 - k * STEP - 30, AXIS_Y - 12, 60), ...fs(13, 12), textAlign: "center" }}>
          {c.secondsAgo.replace("{n}", String(k * 5))}
        </span>
      ))}
      <span className="font-mono font-bold uppercase tracking-widest text-brand-emerald" style={{ ...place(TRACK.x1 - 40, AXIS_Y - 12, 80), ...fs(13, 12), textAlign: "center" }}>
        {c.now}
      </span>

      {AGENTS.map((a, i) => (
        <LaneWords key={a.id} lane={i} lap={lap} clock={clock} />
      ))}

      <div className="flex items-center justify-between px-[1.4em] font-mono uppercase tracking-wider text-foreground/70" style={{ ...place(DECK.x, FOOT_Y, DECK.w, H - FOOT_Y), ...fs(13, 12) }}>
        {filter ? (
          <button type="button" onClick={onClear} className="cursor-pointer uppercase text-brand-cyan transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan">
            {o.showAll}
          </button>
        ) : (
          <span>{o.footer}</span>
        )}
        <span className="text-brand-emerald">{still ? o.status.snapshot : o.status.autoRefreshing}</span>
      </div>
    </>
  );
}
