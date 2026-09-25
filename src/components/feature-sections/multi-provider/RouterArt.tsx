"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import {
  TOKENS,
  dockPulse,
  laneD,
  laneLit,
  tokenAt,
  tokenQ,
  type LaneKey,
  type Layout,
  type Token,
} from "./routerGeometry";

/* The drawing for the "router" variant. Ollama is a user-chosen lane, not an
 * automatic fallback: the app's failover chain is Claude-only (engine/failover.rs). */

const ORANGE = "text-orange-500 dark:text-orange-400";
/* Emerald as the current section draws Ollama (Tailwind), so it holds in every theme. */
const EMERALD = "text-emerald-600 dark:text-emerald-400";
const tone = (k: LaneKey) => (k === "ollama" ? EMERALD : ORANGE);
const LABELS: Record<LaneKey, string> = { haiku: "Haiku", sonnet: "Sonnet", opus: "Opus", ollama: "Ollama" };

function Route({ l, t, p }: { l: Layout; t: Token; p: MotionValue<number> }) {
  const lane = l.lanes[t.lane];
  const x = useTransform(p, (v) => tokenAt(l, t, tokenQ(v, t))[0]);
  const y = useTransform(p, (v) => tokenAt(l, t, tokenQ(v, t))[1]);
  const lit = useTransform(p, (v) => laneLit(tokenQ(v, t)));
  const swell = useTransform(p, (v) => 1 + 0.22 * dockPulse(tokenQ(v, t)));
  const r = t.r * l.tokenScale;
  const [ex, ey] = lane.end;

  return (
    <g>
      <motion.path
        d={laneD(l, lane)}
        fill="none"
        stroke="currentColor"
        strokeWidth={lane.width}
        strokeLinecap="round"
        className={tone(t.lane)}
        style={{ opacity: lit }}
      />
      <motion.circle
        cx={ex}
        cy={ey}
        r={lane.ring}
        fill="currentColor"
        fillOpacity={0.14}
        stroke="currentColor"
        strokeWidth={2}
        className={tone(t.lane)}
        style={{ scale: swell }}
      />
      <motion.g style={{ x, y }}>
        {t.lock ? (
          <>
            <circle r={r} fill="currentColor" className={EMERALD} />
            <Lock x={-r * 0.6} y={-r * 0.6} width={r * 1.2} height={r * 1.2} strokeWidth={2.6} className="text-background" />
          </>
        ) : (
          <circle r={r} fill="currentColor" className="text-foreground" fillOpacity={0.85} />
        )}
      </motion.g>
    </g>
  );
}

export default function RouterArt({ l, p, className }: { l: Layout; p: MotionValue<number>; className: string }) {
  const { machine: m, claude: c, rail, stand } = l;
  const [rx, ry] = l.router;
  const icon = l.font * 1.1;
  const k = l.routerR * 0.5;
  return (
    <svg viewBox={`0 0 ${l.w} ${l.h}`} className={className} aria-hidden="true">
      {/* The machine: everything drawn inside it stays home. */}
      <g className={EMERALD}>
        <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={22} fill="currentColor" fillOpacity={0.03} stroke="currentColor" strokeOpacity={0.4} strokeWidth={2} />
        <rect {...boxAttrs(stand.neck)} fill="currentColor" fillOpacity={0.18} />
        <rect {...boxAttrs(stand.foot)} rx={stand.foot.h / 2} fill="currentColor" fillOpacity={0.28} />
        <text x={l.machineLabel[0]} y={l.machineLabel[1]} fontSize={l.font * 0.85} fontWeight={600} fill="currentColor">
          Local
        </text>
      </g>

      {/* Claude, outside the machine. */}
      <g className={ORANGE}>
        <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={22} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.35} strokeWidth={2} />
        <Sparkles x={l.claudeLabel[0] - icon - 8} y={l.claudeLabel[1] - icon * 0.85} width={icon} height={icon} />
        <text x={l.claudeLabel[0]} y={l.claudeLabel[1]} fontSize={l.font * 1.1} fontWeight={700} fill="currentColor">
          Claude
        </text>
      </g>

      {/* Lanes at rest: the routes exist before anything travels them. */}
      {(Object.keys(l.lanes) as LaneKey[]).map((k) => (
        <path
          key={k}
          d={laneD(l, l.lanes[k])}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.22}
          strokeWidth={l.lanes[k].width}
          strokeLinecap="round"
          strokeDasharray={`${l.lanes[k].width * 1.4} ${l.lanes[k].width * 2}`}
          className={tone(k)}
        />
      ))}

      {/* Input rail. */}
      <rect {...boxAttrs(rail)} rx={rail.h / 2} className="text-foreground" fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.14} />

      {TOKENS.map((t) => (
        <Route key={t.lane} l={l} t={t} p={p} />
      ))}

      {/* Router: drawn last, tokens pass under it. */}
      <circle cx={rx} cy={ry} r={l.routerR} fill={tint("cyan", 16)} stroke={BRAND_VAR.cyan} strokeWidth={2.5} />
      <circle cx={rx} cy={ry} r={l.routerR} fill="var(--background)" fillOpacity={0.55} />
      {/* Split glyph: one hub, three prongs. */}
      <g fill={BRAND_VAR.cyan} stroke={BRAND_VAR.cyan} strokeWidth={2.2} strokeLinecap="round">
        <circle cx={rx - k * 0.7} cy={ry} r={k * 0.28} stroke="none" />
        {[-0.85, 0, 0.85].map((dy) => (
          <g key={dy}>
            <line x1={rx - k * 0.7} y1={ry} x2={rx + k * 0.75} y2={ry + dy * k} />
            <circle cx={rx + k * 0.75} cy={ry + dy * k} r={k * 0.18} stroke="none" />
          </g>
        ))}
      </g>

      {/* Station labels. */}
      {(Object.keys(l.lanes) as LaneKey[]).map((k) => {
        const lane = l.lanes[k];
        const local = k === "ollama";
        return (
          <text
            key={k}
            x={lane.label[0]}
            y={lane.label[1]}
            textAnchor={lane.anchor}
            fontSize={l.font}
            fontWeight={600}
            fill="currentColor"
            className={local ? EMERALD : "text-foreground"}
            fillOpacity={local ? 1 : 0.85}
          >
            {LABELS[k]}
          </text>
        );
      })}
    </svg>
  );
}

function boxAttrs(b: { x: number; y: number; w: number; h: number }) {
  return { x: b.x, y: b.y, width: b.w, height: b.h };
}

