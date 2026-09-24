"use client";

import { motion } from "framer-motion";
import { Activity, ArrowRight, Brain, Calendar, Inbox, ListTodo, MessageSquare, Plug, RotateCcw, TriangleAlert, UserCheck, type LucideIcon } from "lucide-react";
import { DAY_LETTERS, GMAIL, GOOGLE_CALENDAR, TASK_STEPS, mix, type FrameKind, type SheetConnector, type SheetFrame } from "./CommandCenterIllustration.contact-sheet.data";

/**
 * One frame of the contact sheet. Unexposed it is crop marks, a number, a label
 * and the faint mark of its dimension; developed it prints a small picture of
 * its value tinted in the dimension's colour, plus a one-line caption.
 * Develop = opacity/scale crossfade only. `initial={false}` keeps the server
 * markup at whatever `developed` says (the resting sheet is fully developed).
 */

const FAINT = "color-mix(in srgb, var(--foreground) 16%, transparent)";
const PAPER = "color-mix(in srgb, var(--background) 74%, transparent)";

function cropMarks(c: string) {
  const g = `linear-gradient(${c},${c})`;
  return ["top left", "top right", "bottom left", "bottom right"]
    .flatMap((p) => [`${g} ${p}/12px 1px no-repeat`, `${g} ${p}/1px 12px no-repeat`])
    .join(",");
}

/** The app's dimension icons (DIM_META), used as each frame's unexposed mark. */
const MARK: Record<FrameKind, LucideIcon> = {
  week: Calendar, steps: ListTodo, apps: Plug, message: MessageSquare,
  review: UserCheck, memory: Brain, event: Activity, error: TriangleAlert,
};

function Tile({ color, children, title }: { color: string; children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
      style={{ background: mix(color, 16), boxShadow: `0 0 0 1px ${mix(color, 45)}` }}
    >
      {children}
    </span>
  );
}

function AppTile({ c }: { c: SheetConnector }) {
  return (
    <Tile color={c.color} title={c.label}>
      {/* The catalogue icons are single-colour (currentColor) SVGs; masking prints them in the brand colour. */}
      <span
        role="img"
        aria-label={c.label}
        className="h-[15px] w-[15px]"
        style={{ background: c.color, maskImage: `url(/tools/${c.icon}.svg)`, WebkitMaskImage: `url(/tools/${c.icon}.svg)`, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }}
      />
    </Tile>
  );
}

function Picture({ f }: { f: SheetFrame }) {
  const c = f.color;
  const icon = "h-3.5 w-3.5";
  switch (f.kind) {
    case "week":
      return (
        <span className="flex items-center gap-2">
          <span className="inline-grid grid-cols-7 gap-[2px]" aria-hidden>
            {DAY_LETTERS.map((l, i) => (
              <i key={i} className="h-3.5 w-2 rounded-[2px] not-italic" style={{ background: mix(c, 45) }} title={l} />
            ))}
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">08:00</span>
        </span>
      );
    case "steps":
      return (
        <span className="flex items-center gap-1" aria-hidden>
          {TASK_STEPS.map((s, i) => (
            <span key={s} className="grid h-5 w-6 place-items-center rounded-[3px] font-mono text-xs text-foreground" style={{ border: `1px solid ${mix(c, 70)}`, background: mix(c, 14) }}>
              {i + 1}
            </span>
          ))}
        </span>
      );
    case "apps":
      return (
        <span className="flex items-center gap-1.5">
          <AppTile c={GMAIL} />
          <AppTile c={GOOGLE_CALENDAR} />
        </span>
      );
    case "message":
      return (
        <span className="flex items-center gap-1.5 text-foreground" aria-hidden>
          <ArrowRight className={icon} />
          <Tile color={c}><Inbox className={icon} style={{ color: c }} /></Tile>
        </span>
      );
    case "event":
      return (
        <span className="flex items-center gap-1.5 text-foreground" aria-hidden>
          <Tile color={c}><Activity className={icon} style={{ color: c }} /></Tile>
          <ArrowRight className={icon} />
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1.5 text-foreground" aria-hidden>
          <Tile color={c}><RotateCcw className={icon} style={{ color: c }} /></Tile>
          <ArrowRight className={icon} />
          <Tile color={c}><TriangleAlert className={icon} style={{ color: c }} /></Tile>
        </span>
      );
    default: {
      const Icon = MARK[f.kind];
      return <span aria-hidden><Tile color={c}><Icon className={icon} style={{ color: c }} /></Tile></span>;
    }
  }
}

export default function ContactSheetFrame({ f, n, developed, still }: { f: SheetFrame; n: number; developed: boolean; still: boolean }) {
  const t = still ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };
  const Neg = MARK[f.kind];
  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-col rounded-[4px] px-2.5 py-2 transition-[background] duration-500"
      style={{
        gridColumn: f.cell[0],
        gridRow: f.cell[1],
        background: `${cropMarks(developed ? mix(f.color, 60) : FAINT)}, ${developed ? `linear-gradient(${mix(f.color, 7)}, ${mix(f.color, 7)}), ` : ""}${PAPER}`,
      }}
    >
      <span className="flex items-center gap-1.5 text-xs leading-none">
        <span className="font-mono text-foreground">{String(n).padStart(2, "0")}</span>
        <span className="font-semibold uppercase tracking-[0.1em] transition-colors duration-500" style={{ color: developed ? f.color : "var(--muted-dark)" }}>
          {f.label}
        </span>
        <span aria-hidden className="ml-auto h-1.5 w-1.5 rounded-full transition-colors duration-500" style={{ background: developed ? f.color : FAINT }} />
      </span>

      <span className="relative flex min-h-0 flex-1 items-center justify-center">
        <motion.span aria-hidden className="absolute" initial={false} animate={{ opacity: developed ? 0 : 0.3 }} transition={t} style={{ color: f.color }}>
          <Neg className="h-6 w-6" strokeWidth={1.25} />
        </motion.span>
        <motion.span className="relative flex" initial={false} animate={{ opacity: developed ? 1 : 0, scale: developed ? 1 : 0.9 }} transition={t}>
          <Picture f={f} />
        </motion.span>
      </span>

      <motion.span className="truncate text-xs leading-tight text-foreground/85" initial={false} animate={{ opacity: developed ? 1 : 0 }} transition={t}>
        {f.caption}
      </motion.span>
    </div>
  );
}
