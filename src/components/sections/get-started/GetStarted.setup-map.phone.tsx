"use client";

import type { ReactNode } from "react";
import { AppWindow, Check, Clock, FlaskConical, KeyRound, Laptop, Mail, Sparkles, SquareTerminal, type LucideIcon } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { Mark } from "./GetStarted.shared";
import { T } from "./GetStarted.setup-map.parts";
import type { SetupWords } from "./GetStarted.setup-map";

/* Below md: the five stations stacked inside "your computer", Claude Code under them,
 * and the three outside endpoints below the region. Resolved state only. */

const ROW_H = 76;
const ROW_GAP = 12;
const TOP = 48;
const rowY = (i: number) => TOP + i * (ROW_H + ROW_GAP);
const REGION_BOTTOM = rowY(6) + 4;
const OUT_Y = REGION_BOTTOM + 48;
const H = OUT_Y + 80;

export default function SetupMapPhone({ w }: { w: SetupWords }) {
  const cyan = BRAND_VAR.cyan;
  return (
    <div data-illustrate-art role="img" aria-label={w.artLabel} className="mx-auto mt-8 w-full max-w-sm rounded-2xl border border-glass bg-white/[0.02] p-2 md:hidden">
      <svg viewBox={`0 0 360 ${H}`} className="block h-auto w-full" aria-hidden fill="none">
        <Laptop x={10} y={6} width={18} height={18} color={cyan} strokeWidth={2} />
        <T x={34} y={21} size={16} weight={700} tone="text-brand-cyan" op={1}>{w.region}</T>
        <rect x={6} y={32} width={348} height={REGION_BOTTOM - 32} rx={18} fill={tint("cyan", 4)} stroke={cyan} strokeOpacity={0.45} strokeWidth={2} />

        <Row i={0} n={1} verb={w.verbs.install} brand="cyan" icon={AppWindow}>
          <T x={180} y={rowY(0) + 44} size={16} weight={700}>{w.personas}</T>
        </Row>
        <Row i={1} n={2} verb={w.verbs.connect} brand="cyan" icon={KeyRound}>
          <T x={180} y={rowY(1) + 30} size={14} weight={700}>{w.connections}</T>
          <g className="text-foreground" opacity={0.85}>
            <Mark name="gmail" x={190} y={rowY(1) + 52} size={15} />
            <Mark name="slack" x={214} y={rowY(1) + 52} size={15} />
          </g>
          <T x={232} y={rowY(1) + 57} size={13} weight={600} op={0.8}>{w.keychain}</T>
        </Row>
        <Row i={2} n={3} verb={w.verbs.create} brand="emerald" icon={Mail}>
          <T x={180} y={rowY(2) + 44} size={14} weight={700}>{w.agent}</T>
        </Row>
        <Row i={3} n={4} verb={w.verbs.run} brand="emerald" icon={Clock}>
          <T x={180} y={rowY(3) + 32} size={14} weight={700}>{w.schedule}</T>
          <Check x={180} y={rowY(3) + 44} width={14} height={14} color={BRAND_VAR.emerald} strokeWidth={3} />
          <Check x={196} y={rowY(3) + 44} width={14} height={14} color={BRAND_VAR.emerald} strokeWidth={3} />
          <T x={216} y={rowY(3) + 56} size={13} weight={600} op={0.85}>{w.completed}</T>
        </Row>
        <Row i={4} n={5} verb={w.verbs.improve} brand="purple" icon={FlaskConical}>
          <T x={180} y={rowY(4) + 32} size={14} weight={700}>{w.lab}</T>
          <rect x={178} y={rowY(4) + 42} width={120} height={24} rx={7} fill={tint("purple", 14)} />
          <T x={188} y={rowY(4) + 59} size={13} weight={700}>{w.v2}</T>
          <T x={290} y={rowY(4) + 59} size={13} weight={700} anchor="end" tone="text-brand-purple" op={1}>{w.active}</T>
        </Row>
        {/* Already there before step 1 */}
        <rect x={20} y={rowY(5)} width={320} height={ROW_H - 12} rx={12} fill="var(--background)" stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.5} className="text-foreground" />
        <SquareTerminal x={34} y={rowY(5) + 20} width={22} height={22} color={BRAND_VAR.amber} strokeWidth={2} />
        <T x={66} y={rowY(5) + 30} size={15} weight={700}>{w.claudeCode}</T>
        <T x={66} y={rowY(5) + 50} size={13} weight={500} op={0.72}>{w.signedIn}</T>

        {/* The only lines that leave your computer */}
        {[48, 118].map((x) => (
          <line key={x} x1={x} x2={x} y1={REGION_BOTTOM} y2={OUT_Y - 24} stroke={cyan} strokeWidth={2} />
        ))}
        <line x1={270} x2={270} y1={rowY(5) + ROW_H - 12} y2={OUT_Y - 26} stroke={BRAND_VAR.amber} strokeWidth={2} />
        {(["gmail", "slack"] as const).map((k, i) => (
          <g key={k}>
            <rect x={[48, 118][i] - 26} y={OUT_Y - 24} width={52} height={44} rx={10} fill="var(--background)" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} className="text-foreground" />
            <g className="text-foreground" opacity={0.88}>
              <Mark name={k} x={[48, 118][i]} y={OUT_Y - 2} size={20} />
            </g>
            <T x={[48, 118][i]} y={OUT_Y + 42} size={13} anchor="middle">{w[k]}</T>
          </g>
        ))}
        <rect x={206} y={OUT_Y - 26} width={128} height={52} rx={12} fill={tint("amber", 10)} stroke={BRAND_VAR.amber} strokeOpacity={0.6} strokeWidth={1.6} />
        <Sparkles x={222} y={OUT_Y - 11} width={22} height={22} color={BRAND_VAR.amber} strokeWidth={2} />
        <T x={254} y={OUT_Y + 6} size={16} weight={700}>{w.claude}</T>
      </svg>
    </div>
  );
}

function Row({ i, n, verb, brand, icon: Icon, children }: { i: number; n: number; verb: string; brand: BrandKey; icon: LucideIcon; children: ReactNode }) {
  const y = rowY(i);
  return (
    <g>
      <rect x={20} y={y} width={320} height={ROW_H - 12} rx={12} fill={tint(brand, 8)} stroke={tint(brand, 55)} strokeWidth={1.5} />
      <circle cx={42} cy={y + 32} r={13} fill={BRAND_VAR.cyan} />
      <text x={42} y={y + 37} textAnchor="middle" fontSize={14} fontWeight={800} fill="var(--background)">
        {n}
      </text>
      <T x={64} y={y + 38} size={15} weight={700}>{verb}</T>
      <Icon x={146} y={y + 22} width={20} height={20} color={BRAND_VAR[brand]} strokeWidth={2} />
      {children}
    </g>
  );
}
