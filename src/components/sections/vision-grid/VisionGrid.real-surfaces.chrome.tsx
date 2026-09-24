"use client";

import type { ReactNode } from "react";
import type { SamplePersona } from "./VisionGrid.real-surfaces.data";

/** Theme-adaptive glass fill (the site's `--surface-overlay` channel). */
export function glass(alpha: number): string {
  return `rgba(var(--surface-overlay), ${alpha})`;
}

/** Data-driven colour tint (persona / connector / provider hex from data). */
export function hexTint(color: string, pct: number): string {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

/**
 * The reduced app window every card carries: a header naming the app screen
 * (the same title the desktop app uses) with an optional meta slot, and a
 * fixed-height body so nothing shifts when the section hydrates.
 */
export function ScreenFrame({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="flex h-[236px] flex-col overflow-hidden rounded-xl border border-glass"
      style={{ backgroundColor: glass(0.025) }}
    >
      <div
        className="flex h-8 shrink-0 items-center gap-2 border-b border-glass px-3"
        style={{ backgroundColor: glass(0.02) }}
      >
        <span aria-hidden className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: glass(0.14) }} />
          ))}
        </span>
        <span className="text-xs font-bold text-foreground">{title}</span>
        {meta && <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">{meta}</span>}
      </div>
      <div className="min-h-0 flex-1 px-3 py-2.5">{children}</div>
    </div>
  );
}

/** A connector's real brand glyph (`/public/tools/*.svg`) painted in its brand colour. */
export function ConnectorGlyph({ icon, color, size = 14 }: { icon?: string; color: string; size?: number }) {
  if (!icon) return <span aria-hidden className="rounded-sm" style={{ width: size, height: size, backgroundColor: color }} />;
  const url = `url(/tools/${icon}.svg)`;
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

/** The app's 24px tinted tile (connector tile, persona icon frame). */
export function Tile({ color, children, size = 24 }: { color: string; children: ReactNode; size?: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-md border"
      style={{
        width: size,
        height: size,
        backgroundColor: hexTint(color, 10),
        borderColor: hexTint(color, 24),
      }}
    >
      {children}
    </span>
  );
}

/** Persona chip: framed icon in the persona colour + name. */
export function PersonaChip({ persona }: { persona: SamplePersona }) {
  const Icon = persona.icon;
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Tile color={persona.color} size={22}>
        <Icon className="h-3 w-3" style={{ color: persona.color }} />
      </Tile>
      <span className="truncate text-xs font-medium text-foreground">{persona.name}</span>
    </span>
  );
}
