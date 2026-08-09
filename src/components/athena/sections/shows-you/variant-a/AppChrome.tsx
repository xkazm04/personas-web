"use client";

import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, PANEL } from "@/components/athena/stage/athena-tokens";
import { COPY, STOPS, type Rect, type StopId } from "./data";

/**
 * The stylized desktop app "The Glide" plays inside — window chrome
 * (header, sidebar, footer rail slot) plus the main canvas where every
 * walkthrough target is absolutely positioned by the same percent rects
 * the brackets and orb use, so lock-on always lands pixel-true.
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

/** Window frame: header + sidebar + canvas (children overlay it) + footer. */
export function AppWindow({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${PANEL}`}>
      {/* Header bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-glass px-4 py-2.5">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
        </span>
        <span className="text-sm font-semibold text-foreground">{COPY.chrome.appName}</span>
        <span className="ml-auto hidden rounded-full border border-glass px-3 py-1 text-xs text-muted-dark sm:block">
          {COPY.chrome.search}
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar — recognizable nav, words as short labels */}
        <nav className="hidden w-44 shrink-0 flex-col gap-1 border-r border-glass p-3 md:flex">
          {COPY.chrome.nav.map((item, i) => (
            <span
              key={item}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                i === COPY.chrome.navActive
                  ? "text-foreground"
                  : "text-muted-dark"
              }`}
              style={i === COPY.chrome.navActive ? { backgroundColor: tint("cyan", 10) } : undefined}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${i === COPY.chrome.navActive ? "" : "bg-foreground/25"}`}
                style={i === COPY.chrome.navActive ? { backgroundColor: BRAND_VAR.cyan } : undefined}
                aria-hidden="true"
              />
              {item}
            </span>
          ))}
          <span className="mt-auto rounded-lg border border-glass px-2.5 py-1.5 text-center text-sm text-foreground">
            + {COPY.chrome.newAgent}
          </span>
        </nav>

        {/* Main canvas — targets + decor live here; overlays stack on top */}
        <div className="relative min-h-0 flex-1">{children}</div>
      </div>

      {/* Footer — progress rail + mono status line, inside the illustration */}
      <div className="flex shrink-0 items-center gap-4 border-t border-glass px-4 py-2.5">
        {footer}
      </div>
    </div>
  );
}

/** All canvas content: four walkthrough targets + decorative panels. */
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
  return (
    <div className="absolute inset-0">
      <SectionLabel x={5} y={4} text={c.templatesLabel} />
      <TargetPanel rect={STOP_RECT.template} locked={lockedId === "template"}>
        <span className="text-sm font-semibold text-foreground">{c.templateTitle}</span>
        <span className="text-xs text-muted-dark">{c.templateSub}</span>
      </TargetPanel>
      <div className={`absolute flex-col justify-center gap-1 rounded-xl border border-glass px-3 hidden sm:flex`} style={rectStyle({ x: 46, y: 10, w: 36, h: 24 })}>
        <span className="text-sm font-semibold text-foreground/70">{c.templateAltTitle}</span>
        <span className="text-xs text-muted-dark">{c.templateAltSub}</span>
      </div>

      <SectionLabel x={5} y={41} text={c.connectLabel} />
      <TargetPanel rect={STOP_RECT.connect} locked={lockedId === "connect"} row>
        <span className="text-sm font-semibold text-foreground">{c.slack}</span>
        <span className="rounded-full border border-glass px-2 py-0.5 text-xs text-brand-cyan">{c.slackState}</span>
      </TargetPanel>
      <DecorChip x={35} y={47} label={c.github} />
      <DecorChip x={58} y={47} label={c.notion} hideSm />

      <SectionLabel x={5} y={64} text={c.triggerLabel} />
      <TargetPanel rect={STOP_RECT.trigger} locked={lockedId === "trigger"} row>
        <span className="font-mono text-sm text-foreground">{c.triggerValue}</span>
        <span className="text-xs text-muted-dark">{c.triggerHint}</span>
      </TargetPanel>
      <Sparkline />

      {/* Final stop — a real action button; the walkthrough ends on action */}
      <motion.button
        type="button"
        tabIndex={-1}
        className="absolute flex items-center justify-center rounded-xl text-sm font-semibold text-background"
        style={{
          ...rectStyle(STOP_RECT.action),
          backgroundColor: BRAND_VAR.cyan,
          boxShadow: brandShadow("cyan", pulse ? 36 : 18, pulse ? 40 : 22),
        }}
        animate={pulse && !reduced ? { scale: [1, 1.045, 1] } : { scale: 1 }}
        transition={pulse && !reduced ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        {c.action}
      </motion.button>
    </div>
  );
}

function SectionLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <span className={`absolute ${ANNOTATION_DIM} normal-case tracking-widest text-xs`} style={{ left: `${x}%`, top: `${y}%` }}>
      {text}
    </span>
  );
}

/** A walkthrough target: glows while locked — the rest is never dimmed. */
function TargetPanel({ rect, locked, row, children }: { rect: Rect; locked: boolean; row?: boolean; children: ReactNode }) {
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

function DecorChip({ x, y, label, hideSm }: { x: number; y: number; label: string; hideSm?: boolean }) {
  return (
    <div
      className={`absolute items-center rounded-xl border border-glass px-3 text-sm text-foreground/70 ${hideSm ? "hidden lg:flex" : "hidden sm:flex"}`}
      style={rectStyle({ x, y, w: 20, h: 12 })}
    >
      {label}
    </div>
  );
}

/** Decorative activity sparkline — SVG gradient def keyed by useId. */
function Sparkline() {
  const uid = useId();
  return (
    <div className="absolute hidden flex-col gap-1 rounded-xl border border-glass p-3 lg:flex" style={rectStyle({ x: 63, y: 64, w: 31, h: 15 })}>
      <span className="text-xs text-muted-dark">{COPY.canvas.activityLabel}</span>
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-spark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tint("cyan", 35)} />
            <stop offset="100%" stopColor={tint("cyan", 0)} />
          </linearGradient>
        </defs>
        <path d="M0 20 L14 16 L28 18 L42 10 L56 13 L70 6 L84 9 L100 3 L100 24 L0 24 Z" fill={`url(#${uid}-spark)`} />
        <path d="M0 20 L14 16 L28 18 L42 10 L56 13 L70 6 L84 9 L100 3" fill="none" stroke={BRAND_VAR.cyan} strokeWidth="1.2" />
      </svg>
    </div>
  );
}
