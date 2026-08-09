"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { ActivityChart } from "./ActivityChart";
import { COPY, STOPS, type Rect, type StopId } from "./data";

/**
 * All canvas content of the stylized app: the four walkthrough targets plus
 * decorative modules (second template card, linked-connector chips, the
 * Monitoring chart). Targets are absolutely positioned by the same percent
 * rects the brackets and orb use — lock-on always lands pixel-true.
 * Type floor: text-base everywhere.
 */

const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

const STOP_RECT: Record<StopId, Rect> = Object.fromEntries(
  STOPS.map((s) => [s.id, s.rect]),
) as Record<StopId, Rect>;

export function CanvasScene({
  lockedId,
  pulse,
  reduced,
}: {
  lockedId: StopId | null;
  pulse: boolean;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  const TriggerIcon = c.triggerIcon;
  const HintIcon = c.triggerHintIcon;
  const ActionIcon = c.actionIcon;
  return (
    <div className="absolute inset-0">
      <SectionLabel x={5} y={4} text={c.templatesLabel} />
      <TargetPanel rect={STOP_RECT.template} locked={lockedId === "template"}>
        <TemplateCard {...c.template} />
      </TargetPanel>
      <div
        className="absolute hidden flex-col justify-center rounded-xl border border-glass px-3 sm:flex"
        style={rectStyle({ x: 46, y: 10, w: 36, h: 24 })}
      >
        <TemplateCard {...c.templateAlt} dim />
      </div>

      <SectionLabel x={5} y={41} text={c.connectLabel} />
      <TargetPanel rect={STOP_RECT.connect} locked={lockedId === "connect"} row>
        <span className="flex min-w-0 items-center gap-2 text-base font-semibold text-foreground">
          <c.slack.icon className="h-4.5 w-4.5 shrink-0 text-brand-cyan" aria-hidden="true" />
          <span className="truncate">{c.slack.name}</span>
        </span>
        <span className="shrink-0 rounded-full border border-glass px-2.5 py-0.5 text-base text-brand-cyan">
          {c.slack.state}
        </span>
      </TargetPanel>
      <ConnectorChip x={42} chip={c.chips[0]} />
      <ConnectorChip x={67} chip={c.chips[1]} hideSm />

      <SectionLabel x={5} y={64} text={c.triggerLabel} />
      <TargetPanel rect={STOP_RECT.trigger} locked={lockedId === "trigger"} row>
        <span className="flex min-w-0 items-center gap-2 font-mono text-base text-foreground">
          <TriggerIcon className="h-4.5 w-4.5 shrink-0 text-brand-cyan" aria-hidden="true" />
          <span className="truncate">{c.triggerValue}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 text-base text-muted-dark sm:flex">
          <HintIcon className="h-4 w-4" aria-hidden="true" />
          {c.triggerHint}
        </span>
      </TargetPanel>
      <ActivityChart rect={{ x: 63, y: 64, w: 31, h: 16 }} reduced={reduced} />

      {/* Final stop — a real action button; the walkthrough ends on action */}
      <motion.button
        type="button"
        tabIndex={-1}
        className="absolute flex items-center justify-center gap-2 rounded-xl text-base font-semibold text-background"
        style={{
          ...rectStyle(STOP_RECT.action),
          backgroundColor: BRAND_VAR.cyan,
          boxShadow: brandShadow("cyan", pulse ? 36 : 18, pulse ? 40 : 22),
        }}
        animate={pulse && !reduced ? { scale: [1, 1.045, 1] } : { scale: 1 }}
        transition={pulse && !reduced ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <ActionIcon className="h-4.5 w-4.5" aria-hidden="true" />
        {c.action}
      </motion.button>
    </div>
  );
}

/** Template card body — icon + name + one-line meta row + status pill. */
function TemplateCard({
  icon: Icon,
  title,
  meta,
  pill,
  dim,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  meta: string;
  pill: string;
  dim?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-col gap-1.5">
      <span className="flex min-w-0 items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: tint("cyan", dim ? 8 : 14) }}
        >
          <Icon className="h-4.5 w-4.5 text-brand-cyan" aria-hidden={true} />
        </span>
        <span className={`truncate text-base font-semibold ${dim ? "text-foreground/70" : "text-foreground"}`}>
          {title}
        </span>
        <span className="ml-auto hidden shrink-0 rounded-full border border-glass px-2 py-0.5 text-base text-muted-dark lg:block">
          {pill}
        </span>
      </span>
      <span className="truncate text-base text-muted-dark">{meta}</span>
    </span>
  );
}

function SectionLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <span
      className={`absolute ${ANNOTATION_DIM} normal-case tracking-widest`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {text}
    </span>
  );
}

/** A walkthrough target: glows while locked — the rest is never dimmed. */
function TargetPanel({
  rect,
  locked,
  row,
  children,
}: {
  rect: Rect;
  locked: boolean;
  row?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute flex rounded-xl border px-3 transition-all duration-500 ${
        row ? "flex-row items-center justify-between gap-2" : "flex-col justify-center gap-1"
      } ${locked ? "border-glass-hover" : "border-glass"}`}
      style={{
        ...rectStyle(rect),
        backgroundColor: locked ? tint("cyan", 8) : undefined,
        boxShadow: locked ? brandShadow("cyan", 22, 24) : undefined,
      }}
    >
      {children}
    </div>
  );
}

/** Already-linked connector chip — glyph + name + state pill. */
function ConnectorChip({
  x,
  chip,
  hideSm,
}: {
  x: number;
  chip: (typeof COPY.canvas.chips)[number];
  hideSm?: boolean;
}) {
  const Icon = chip.icon;
  return (
    <div
      className={`absolute items-center gap-2 rounded-xl border border-glass px-3 text-base text-foreground/70 ${
        hideSm ? "hidden lg:flex" : "hidden sm:flex"
      }`}
      style={rectStyle({ x, y: 47, w: 22, h: 12 })}
    >
      <Icon className="h-4.5 w-4.5 shrink-0 text-muted-dark" aria-hidden="true" />
      <span className="truncate">{chip.name}</span>
      <span className="ml-auto h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: BRAND_VAR.cyan }} aria-hidden="true" />
    </div>
  );
}
