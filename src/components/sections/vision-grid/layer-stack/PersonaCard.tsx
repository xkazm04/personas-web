"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Clock, Cpu, DollarSign, FlaskConical, Inbox, LayoutGrid, Lock, Zap } from "lucide-react";
import { BRAND_VAR, STATE_COLORS, tint } from "@/lib/brand-theme";
import { SAMPLE_CONNECTORS, SAMPLE_PERSONA, type CardPart, type StackLayer } from "./layers";

/**
 * The sample agent at the top of the stack, reduced from the app's persona
 * card (PersonaOverviewCardList): health stripe on the left edge, persona
 * colour as a tinted icon frame, 24px connector tiles, trigger chip, and a
 * footer of last run / spend. Each part a layer is responsible for lights in
 * that layer's colour when the layer is selected.
 */
export function LayerStackPersonaCard({ active }: { active: StackLayer }) {
  const p = SAMPLE_PERSONA;
  const lit = (part: CardPart): CSSProperties =>
    active.part === part
      ? { boxShadow: `0 0 0 1px ${BRAND_VAR[active.brand]}`, backgroundColor: tint(active.brand, 14) }
      : { boxShadow: "0 0 0 1px transparent" };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-glass-hover bg-white/[0.03] backdrop-blur-sm"
      style={{ borderLeft: `2px solid ${tint("emerald", 70)}` }}
    >
      <div className="flex items-start gap-3 px-3.5 pt-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
          style={{ borderColor: tint(p.brand, 20), backgroundColor: tint(p.brand, 8) }}
        >
          <Inbox className="h-4 w-4" style={{ color: BRAND_VAR[p.brand] }} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-foreground">{p.name}</span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATE_COLORS.success }} aria-hidden />
              Active
            </span>
          </div>
          <Chip style={lit("origin")} className="-ml-1 mt-0.5">
            <LayoutGrid className="h-3 w-3" aria-hidden />
            from {p.origin}
          </Chip>
        </div>
        <Chip style={lit("model")} className="border border-glass">
          <Cpu className="h-3 w-3" aria-hidden />
          {p.model}
        </Chip>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3.5 pt-2.5">
        <div className="flex items-center gap-1 rounded-lg p-0.5 transition-[background-color,box-shadow] duration-300" style={lit("keys")}>
          {SAMPLE_CONNECTORS.map((c) => (
            <span
              key={c.name}
              title={c.label}
              className="flex h-6 w-6 items-center justify-center rounded-md border"
              style={{ borderColor: `${c.color}33`, backgroundColor: `${c.color}1a` }}
            >
              <Image src={`/tools/${c.icon}.svg`} alt={c.label} width={14} height={14} />
            </span>
          ))}
          <Lock className="mx-1 h-3 w-3 text-muted" aria-label="Credentials stored locally" />
        </div>
        <Chip style={lit("trigger")} className="border border-glass font-mono">
          <Zap className="h-3 w-3" aria-hidden />
          {p.trigger}
        </Chip>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1 border-t border-glass px-2.5 py-1.5">
        <Chip style={lit("run")}>
          <Clock className="h-3 w-3" aria-hidden />
          {p.lastRun}
        </Chip>
        <Chip>
          <DollarSign className="h-3 w-3" aria-hidden />
          {p.spend.replace("$", "")}
        </Chip>
        <Chip style={lit("prompt")} className="font-mono">
          <FlaskConical className="h-3 w-3" aria-hidden />
          {p.prompt}
        </Chip>
      </div>
    </div>
  );
}

function Chip({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted tabular-nums transition-[background-color,box-shadow] duration-300 ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
