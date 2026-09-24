"use client";

import { motion } from "framer-motion";
import type { Tool } from "./types";
import ConnectorIcon from "./components/ConnectorIcon";
import { JOB_COLS, PERSONA, ROW_BEAT_S, type Cell } from "./UseCases.job-matrix.model";

/** Row template shared by the header row and every tool row. */
export const ROW_GRID =
  "grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_148px_repeat(3,minmax(0,1fr))]";

/** A connector tile in the tool's own brand colour (tint from data). */
export function ToolTile({ tool, size = 24 }: { tool: Tool; size?: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-md border"
      style={{ width: size, height: size, backgroundColor: `${tool.color}1f`, borderColor: `${tool.color}40` }}
    >
      <ConnectorIcon src={tool.icon.src} size={Math.round(size * 0.58)} />
    </span>
  );
}

/**
 * One segment of the persona spine: the vertical line in the persona's colour
 * that runs from its icon through every row. Segments grow top-down in turn, so
 * the sweep reads as one line being drawn.
 */
export function SpineSegment({ lit, beat, last = false, node = true, className = "self-stretch" }: {
  lit: boolean;
  beat: number;
  /** The last row stops the line at its node. */
  last?: boolean;
  node?: boolean;
  className?: string;
}) {
  const delay = beat * ROW_BEAT_S;
  // The node sits beside the tool name: centred on desktop, first line on mobile.
  const line = `absolute left-1/2 top-0 w-0.5 -translate-x-1/2 ${last ? "bottom-[calc(100%-18px)] md:bottom-1/2" : "bottom-0"}`;
  const at = "absolute left-1/2 top-[18px] md:top-1/2";
  return (
    <div aria-hidden className={`relative ${className}`}>
      <span className={`${line} bg-white/[0.06]`} />
      <motion.span
        className={`${line} rounded-full`}
        style={{ background: PERSONA.color, originY: 0 }}
        initial={false}
        animate={{ scaleY: lit ? 1 : 0 }}
        transition={lit ? { delay, duration: ROW_BEAT_S, ease: "linear" } : { duration: 0 }}
      />
      {node && (
        <>
          <motion.span
            className={`${at} h-px w-7 -translate-y-1/2`}
            style={{ background: PERSONA.border, originX: 0 }}
            initial={false}
            animate={{ scaleX: lit ? 1 : 0 }}
            transition={lit ? { delay: delay + ROW_BEAT_S * 0.5, duration: 0.2 } : { duration: 0 }}
          />
          <motion.span
            className={`${at} h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border`}
            style={{ background: PERSONA.color, borderColor: PERSONA.strong }}
            initial={false}
            animate={{ opacity: lit ? 1 : 0.25, scale: lit ? 1 : 0.6 }}
            transition={lit ? { delay: delay + ROW_BEAT_S * 0.5, duration: 0.25 } : { duration: 0 }}
          />
        </>
      )}
    </div>
  );
}

interface RowProps {
  tool: Tool;
  row: number;
  last: boolean;
  lit: boolean;
  active: Cell;
  shown: Cell;
  register: (index: number, node: HTMLButtonElement | null) => void;
  onChoose: (cell: Cell) => void;
  onPreview: (cell: Cell | null) => void;
}

export default function MatrixRow({ tool, row, last, lit, active, shown, register, onChoose, onPreview }: RowProps) {
  const rowShown = shown.row === row;
  return (
    <div role="row" className={ROW_GRID}>
      <SpineSegment lit={lit} beat={row + 1} last={last} />
      <div className="flex min-w-0 flex-col gap-1.5 py-1.5 md:contents">
        <div role="rowheader" className="flex min-w-0 items-center gap-2 md:py-1">
          <ToolTile tool={tool} />
          <span className={`truncate text-[13px] font-semibold ${rowShown ? "text-foreground" : "text-foreground/80"}`}>
            {tool.name}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 md:contents">
          {tool.useCases.map((job, col) => {
            const isActive = active.row === row && active.col === col;
            const isShown = rowShown && shown.col === col;
            const cell = { row, col };
            return (
              <div role="gridcell" aria-selected={isActive} key={job.title} className="md:py-1">
                <button
                  ref={(node) => register(row * JOB_COLS + col, node)}
                  type="button"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onChoose(cell)}
                  onFocus={() => onChoose(cell)}
                  onMouseEnter={() => onPreview(cell)}
                  onMouseLeave={() => onPreview(null)}
                  className={`relative w-full rounded-lg border border-glass bg-white/[0.02] px-2.5 py-1.5 text-left text-xs leading-snug transition-colors duration-150 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 md:truncate md:text-[13px] ${
                    isShown ? "text-foreground" : "text-foreground/85"
                  }`}
                  style={isShown ? { borderColor: PERSONA.strong } : undefined}
                >
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ background: PERSONA.bg, boxShadow: `inset 0 0 0 1px ${PERSONA.border}` }}
                    initial={false}
                    animate={{ opacity: lit ? 1 : 0 }}
                    transition={lit ? { delay: (row + 1) * ROW_BEAT_S + col * 0.04 + 0.08, duration: 0.35 } : { duration: 0 }}
                  />
                  <span className="relative">{job.title}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
