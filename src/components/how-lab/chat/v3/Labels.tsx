"use client";

import type { CSSProperties, ReactNode } from "react";
import { Check, User, UserRound } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { AGENT, CUSTOMER, SCRIPT, clockText, fill, mix } from "../shared/scenarios";
import { AGENT_Y, BEADS_X, BUMPER_X, ORIGIN, ROWS, STATIONS, SWITCH, W, H } from "./geometry";

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const place = (x: number, y: number, width: number): CSSProperties => ({ position: "absolute", left: pct(x, W), top: pct(y, H), width: pct(width, W) });
/** A font size of `n` viewBox units, never below `min` px. */
const fs = (n: number, min: number): CSSProperties => ({ fontSize: `max(${min}px, calc(${n} * 100cqw / ${W}))` });
const show = (on: boolean): CSSProperties => ({ opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 6}px)`, transition: "opacity 400ms ease, transform 400ms ease" });

function Tag({ x, y, w, on, color, children, align = "center" }: { x: number; y: number; w: number; on: boolean; color?: string; children: ReactNode; align?: "center" | "right" }) {
  return (
    <span className={`pointer-events-none font-medium leading-tight ${align === "right" ? "text-right" : "text-center"}`} style={{ ...place(x, y, w), ...fs(16, 12), ...show(on), color: color ?? "var(--foreground)" }}>
      {children}
    </span>
  );
}

export default function Labels({ index, row, passed, beadsLit, queued, resolved, t, agentEnd }: { index: number; row: number; passed: number; beadsLit: number; queued: boolean; resolved: boolean; t: number; agentEnd: number }) {
  const c = useTranslation().t.howLab.chat;
  const copy = c.scenarios[index];
  const map = c.v3.scenarios[index];
  const y = ROWS[row];
  const soft = (col: string) => `color-mix(in srgb, ${col} 60%, var(--foreground))`;

  return (
    <>
      {/* The customer's message, entering at the origin. */}
      <div className="absolute hidden rounded-2xl rounded-br-md border px-[1.2cqw] py-[1cqw] md:block" style={{ ...place(16, ORIGIN[1], 274), transform: "translateY(-50%)", borderColor: mix(CUSTOMER, 40), background: `linear-gradient(135deg, ${mix(CUSTOMER, 14)}, color-mix(in srgb, var(--background) 80%, transparent))` }}>
        <span className="flex items-center gap-1.5 font-mono uppercase tracking-[0.14em]" style={{ ...fs(13, 12), color: CUSTOMER }}>
          <User className="h-[1em] w-[1em]" aria-hidden />
          {c.customer}
        </span>
        <span className="mt-1 block leading-snug text-foreground" style={fs(18, 16)}>
          &ldquo;{copy.message}&rdquo;
        </span>
      </div>

      <Tag x={SWITCH[0] - 64} y={SWITCH[1] + 22} w={110} on color="var(--muted)">
        {c.v3.switchLabel}
      </Tag>

      {ROWS.map((ry, r) => (
        <Tag key={r} x={420} y={ry - 27} w={205} on align="right" color={r === row ? soft(SCRIPT) : "var(--muted)"}>
          {c.v3.tracks[r]}
        </Tag>
      ))}
      {STATIONS.map((x, k) => (
        <Tag key={`${index}-${k}`} x={x - 55} y={y + 14} w={110} on={k < passed}>
          {map.stations[k]}
        </Tag>
      ))}
      <Tag x={BUMPER_X - 208} y={y - 27} w={196} align="right" on={passed > 3} color={soft(SCRIPT)}>
        <strong className="whitespace-nowrap">{map.deadEnd}</strong>
      </Tag>

      {BEADS_X.map((x, k) => (
        <Tag key={`${index}-b${k}`} x={x - 98} y={AGENT_Y + 18} w={196} on={k < beadsLit} color={soft(AGENT)}>
          <span className="whitespace-nowrap">{map.thoughts[k]}</span>
        </Tag>
      ))}

      {/* Two terminals, one column: where each traveller ends up. */}
      <Terminal x={1070} y={140} color={AGENT} icon={<Check className="h-[1em] w-[1em]" aria-hidden />} title={c.v3.resolved} on={resolved}>
        {copy.agentOutcome} <span className="font-normal text-muted">{fill(c.inSeconds, agentEnd)}</span>
      </Terminal>
      <Terminal x={1070} y={318} color={SCRIPT} icon={<UserRound className="h-[1em] w-[1em]" aria-hidden />} title={c.v3.humanQueue} on={queued}>
        {copy.scriptedOutcome}
      </Terminal>

      {/* Legend (top left, above the agent's lift-off) and the one clock (bottom left). */}
      <div className="absolute hidden flex-col gap-1.5 md:flex" style={{ ...place(16, 18, 280), ...fs(15, 12) }}>
        <span className="flex items-center gap-2 text-foreground/85">
          <span className="h-[0.3em] w-[1.6em] rounded-full" style={{ background: SCRIPT }} />
          {c.v3.rails}
        </span>
        <span className="flex items-center gap-2 text-foreground/85">
          <span className="h-[0.3em] w-[1.6em] rounded-full" style={{ background: AGENT }} />
          {c.v3.agentRoute}
        </span>
      </div>
      <div className="absolute flex items-baseline gap-2" style={{ ...place(16, 404, 280) }}>
        <span className="font-mono font-semibold tabular-nums text-foreground" style={fs(30, 18)}>
          {clockText(t)}
        </span>
        <span className="font-mono uppercase tracking-[0.12em] text-muted" style={fs(13, 12)}>
          {c.v1.clock}
        </span>
      </div>
      <span className="pointer-events-none absolute bottom-[1%] right-[1%] font-mono text-xs uppercase tracking-[0.14em] text-muted-dark">{c.stylised}</span>
    </>
  );
}

function Terminal({ x, y, color, icon, title, on, children }: { x: number; y: number; color: string; icon: ReactNode; title: string; on: boolean; children: ReactNode }) {
  return (
    <div className="absolute rounded-xl border px-[1cqw] py-[0.8cqw] transition-[background-color,border-color] duration-500" style={{ ...place(x, y, 224), borderColor: mix(color, on ? 60 : 22), background: on ? mix(color, 14) : "transparent" }}>
      <span className="flex items-center gap-1.5 font-mono font-semibold uppercase tracking-[0.14em]" style={{ ...fs(14, 12), color }}>
        {icon}
        {title}
      </span>
      <span className="mt-1 block min-h-[2.6em] font-semibold leading-snug text-foreground" style={{ ...fs(17, 14), ...show(on) }}>
        {children}
      </span>
    </div>
  );
}
