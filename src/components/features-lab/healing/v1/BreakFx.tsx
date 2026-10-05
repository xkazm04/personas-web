"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { CaseId } from "../shared/cases";

const SPARKS = [0, 60, 120, 180, 240, 300];

/** What happens at the break point, phase by phase: spark, scan, the case's own fix, the healed seal. */
export default function BreakFx({ x, y, phase, caseId, running }: { x: number; y: number; phase: number; caseId: CaseId; running: boolean }) {
  const loop = (duration: number) => (running ? { duration, repeat: Infinity, ease: "easeOut" as const } : { duration: 0 });
  const origin = { transformBox: "view-box" as const, transformOrigin: `${x}px ${y}px` };

  if (phase === 1)
    return (
      <g>
        <circle cx={x} cy={y} r={9} fill={BRAND_VAR.rose} filter="url(#hl-glow)" />
        <motion.g style={origin} initial={{ scale: 1, opacity: 0.9 }} animate={running ? { scale: [0.5, 1.35], opacity: [1, 0] } : { scale: 1, opacity: 0.9 }} transition={loop(0.7)}>
          {SPARKS.map((a) => (
            <line
              key={a}
              x1={x + 12 * Math.cos((a * Math.PI) / 180)}
              y1={y + 12 * Math.sin((a * Math.PI) / 180)}
              x2={x + 24 * Math.cos((a * Math.PI) / 180)}
              y2={y + 24 * Math.sin((a * Math.PI) / 180)}
              stroke={BRAND_VAR.rose}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          ))}
        </motion.g>
      </g>
    );

  if (phase === 2)
    return (
      <g>
        <circle cx={x} cy={y} r={20} fill={tint("amber", 16)} />
        <motion.circle
          cx={x}
          cy={y}
          r={20}
          fill="none"
          stroke={BRAND_VAR.amber}
          strokeWidth={2.2}
          strokeDasharray="10 6"
          style={origin}
          animate={running ? { rotate: 360 } : { rotate: 0 }}
          transition={running ? { duration: 2.4, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        />
        <circle cx={x - 2} cy={y - 2} r={6} fill="none" stroke={BRAND_VAR.amber} strokeWidth={2.2} />
        <line x1={x + 2.5} y1={y + 2.5} x2={x + 8} y2={y + 8} stroke={BRAND_VAR.amber} strokeWidth={2.6} strokeLinecap="round" />
      </g>
    );

  if (phase === 3) return <Fix x={x} y={y} caseId={caseId} running={running} />;

  if (phase === 4 && caseId === "login") return <Seal x={x} y={y} tone="rose" glyph="person" pop={running} />;
  if (phase === 4) return <Seal x={x} y={y} tone="emerald" glyph="check" pop={running} />;
  return null;
}

function Fix({ x, y, caseId, running }: { x: number; y: number; caseId: CaseId; running: boolean }) {
  const disc = <circle cx={x} cy={y} r={22} fill="color-mix(in srgb, var(--background) 82%, var(--brand-cyan))" stroke={BRAND_VAR.cyan} strokeWidth={1.6} />;
  const num = (s: string, c = BRAND_VAR.cyan) => (
    <text x={x} y={y + 5.5} textAnchor="middle" fontSize={15} fontWeight={700} fill={c}>
      {s}
    </text>
  );
  if (caseId === "rateLimit")
    return (
      <g>
        {disc}
        <motion.circle
          cx={x}
          cy={y}
          r={22}
          fill="none"
          stroke={BRAND_VAR.amber}
          strokeWidth={3.2}
          strokeLinecap="round"
          style={{ transformBox: "view-box", transformOrigin: `${x}px ${y}px`, rotate: -90 }}
          initial={{ pathLength: running ? 1 : 0.35 }}
          animate={{ pathLength: running ? 0 : 0.35 }}
          transition={{ duration: running ? 2.5 : 0, ease: "linear" }}
        />
        {num("30")}
      </g>
    );
  if (caseId === "timeout")
    return (
      <g>
        <rect x={x - 26} y={y - 15} width={52} height={30} rx={9} fill="color-mix(in srgb, var(--background) 82%, var(--brand-cyan))" stroke={BRAND_VAR.cyan} strokeWidth={1.6} />
        {num("×2")}
      </g>
    );
  if (caseId === "overload")
    return (
      <g>
        {disc}
        <path d={`M ${x - 5} ${y - 8} L ${x + 8} ${y} L ${x - 5} ${y + 8} Z`} fill={BRAND_VAR.cyan} />
        <motion.circle
          cx={x}
          cy={y}
          r={27}
          fill="none"
          stroke={BRAND_VAR.purple}
          strokeWidth={1.6}
          style={{ transformBox: "view-box", transformOrigin: `${x}px ${y}px` }}
          animate={running ? { scale: [0.9, 1.15], opacity: [0.9, 0] } : { scale: 1, opacity: 0.6 }}
          transition={running ? { duration: 1.3, repeat: Infinity } : { duration: 0 }}
        />
      </g>
    );
  // login: the breaker opens, no retry
  return (
    <g>
      <rect x={x - 22} y={y - 18} width={44} height={36} rx={8} fill="color-mix(in srgb, var(--background) 82%, var(--brand-rose))" stroke={BRAND_VAR.rose} strokeWidth={1.6} />
      <motion.line
        x1={x - 12}
        y1={y + 6}
        x2={x + 12}
        y2={y + 6}
        stroke={BRAND_VAR.rose}
        strokeWidth={3.4}
        strokeLinecap="round"
        style={{ transformBox: "view-box", transformOrigin: `${x - 12}px ${y + 6}px` }}
        initial={{ rotate: running ? 0 : -38 }}
        animate={{ rotate: -38 }}
        transition={{ duration: running ? 0.5 : 0, delay: running ? 0.3 : 0 }}
      />
      <circle cx={x - 12} cy={y + 6} r={3.6} fill={BRAND_VAR.rose} />
    </g>
  );
}

function Seal({ x, y, tone, glyph, pop }: { x: number; y: number; tone: "emerald" | "rose"; glyph: "check" | "person"; pop: boolean }) {
  return (
    <motion.g
      style={{ transformBox: "view-box", transformOrigin: `${x}px ${y}px` }}
      initial={pop ? { scale: 0.6, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={pop ? { type: "spring", stiffness: 260, damping: 18 } : { duration: 0 }}
    >
      <circle cx={x} cy={y} r={17} fill={BRAND_VAR[tone]} filter="url(#hl-glow)" opacity={0.35} />
      <circle cx={x} cy={y} r={14} fill={BRAND_VAR[tone]} />
      {glyph === "check" ? (
        <path d={`M ${x - 6} ${y} L ${x - 1.5} ${y + 5} L ${x + 7} ${y - 5}`} fill="none" stroke="var(--background)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <g fill="var(--background)">
          <circle cx={x} cy={y - 3.5} r={3.6} />
          <path d={`M ${x - 7} ${y + 8} q 7 -10 14 0 z`} />
        </g>
      )}
    </motion.g>
  );
}
