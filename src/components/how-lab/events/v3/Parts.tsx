"use client";

import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { DESK, deskFaces, type DeskId, type DeskState } from "./geometry";
import DeskScreen from "./DeskScreen";

const GLASS = "color-mix(in srgb, var(--foreground) 16%, transparent)";

/** A pneumatic tube: a glass wall around a core that lights once it is used. */
export function Tube({ d, color, lit }: { d: string; color: string; lit: boolean }) {
  return (
    <g>
      <path d={d} fill="none" stroke={GLASS} strokeWidth={20} strokeLinecap="round" />
      <path d={d} fill="none" stroke="var(--background)" strokeOpacity={0.78} strokeWidth={15} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeOpacity={lit ? 0.8 : 0.16} strokeWidth={2.5} style={{ transition: "stroke-opacity .5s" }} />
    </g>
  );
}

/**
 * An agent's desk in isometric: three shaded faces in the agent's colour, a
 * monitor on the back edge, and the agent itself - a small stylised bot whose
 * visor lights while it works.
 */
export function Desk({ desk, state, run }: { desk: { id: DeskId; x: number; y: number; brand: BrandKey }; state: DeskState; run: boolean }) {
  const { x, y, brand } = desk;
  const c = BRAND_VAR[brand];
  const faces = deskFaces(x, y);
  const t = y - DESK.h;
  const awake = state === "working" || state === "incoming";
  return (
    <g>
      <ellipse cx={x} cy={y + 8} rx={DESK.hw + 18} ry={DESK.hh + 10} fill={c} fillOpacity={state === "idle" ? 0.04 : 0.12} style={{ transition: "fill-opacity .5s" }} />
      <polygon points={faces.left} fill={`color-mix(in srgb, ${c} 18%, var(--background))`} stroke={GLASS} />
      <polygon points={faces.right} fill={`color-mix(in srgb, ${c} 8%, var(--background))`} stroke={GLASS} />
      <polygon points={faces.top} fill={`color-mix(in srgb, ${c} 26%, var(--background))`} stroke={tint(brand, 50)} />
      <DeskScreen points={faces.screen} x={x} y={y} color={c} state={state} run={run} />
      {/* The agent: body, head, visor. */}
      <ellipse cx={x + 30} cy={t + 6} rx={15} ry={9} fill={`color-mix(in srgb, ${c} 30%, var(--background))`} stroke={tint(brand, 60)} />
      <circle cx={x + 30} cy={t - 14} r={12} fill={`color-mix(in srgb, ${c} 18%, var(--background))`} stroke={tint(brand, 70)} strokeWidth={1.5} />
      <rect
        x={x + 22}
        y={t - 18}
        width={16}
        height={6}
        rx={3}
        fill={c}
        fillOpacity={awake ? 1 : 0.35}
        style={{ transition: "fill-opacity .4s" }}
      />
    </g>
  );
}
