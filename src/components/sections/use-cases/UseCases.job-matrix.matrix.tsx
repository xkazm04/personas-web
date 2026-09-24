"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { Briefcase } from "lucide-react";
import { STATE_COLORS } from "@/lib/brand-theme";
import { useStillMotion } from "@/hooks/useStillMotion";
import { tools } from "./data";
import MatrixRow, { ROW_GRID, SpineSegment, ToolTile } from "./UseCases.job-matrix.row";
import { JOB_COUNT, PERSONA, TOOL_COUNT, useIsClient, useMatrixNav } from "./UseCases.job-matrix.model";

const LABEL = "text-xs font-mono uppercase tracking-[0.12em] text-muted-dark";

/**
 * Job matrix (data-as-art). The persona card is the frame: its identity sits at
 * the top, every real tool from `data.ts` is a row, every real job a cell, and one
 * spine in the persona's colour runs through all of them. Resting state (server,
 * no script, reduced motion) is the finished matrix, fully lit. With motion, the
 * lit layer is armed after mount and the colour sweeps down the rows once when
 * the matrix scrolls into view.
 */
export default function JobMatrix() {
  const still = useStillMotion();
  const client = useIsClient();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(rootRef, { once: true, margin: "0px 0px -20% 0px" });
  const lit = still || !client || inView;

  const nav = useMatrixNav();
  const { register, setActive, setPreview } = nav;

  return (
    <figure
      className="mx-auto max-w-5xl"
      aria-label={`One persona, ${PERSONA.name}, covers ${JOB_COUNT} jobs across ${TOOL_COUNT} tools without changing its identity.`}
    >
      <div
        ref={rootRef}
        className="rounded-2xl border border-glass border-l-2 bg-white/[0.02] px-3 pb-3 pt-4 sm:px-5 sm:pb-4"
        style={{ borderLeftColor: STATE_COLORS.success }}
      >
        {/* Persona head: identity, connector row, derived counts. */}
        <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3">
          <div className="relative flex flex-col items-center">
            <span
              className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border"
              style={{ background: PERSONA.bg, borderColor: PERSONA.border, color: PERSONA.color }}
            >
              <Briefcase aria-hidden className="h-4 w-4" />
            </span>
            <SpineSegment lit={lit} beat={0} node={false} className="w-full flex-1" />
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">{PERSONA.name}</p>
              <p className="font-mono text-xs tabular-nums text-muted">
                1 persona · {TOOL_COUNT} tools · {JOB_COUNT} jobs
              </p>
            </div>
            <div className="flex flex-wrap gap-1" aria-label={`Connected tools: ${tools.map((t) => t.name).join(", ")}`}>
              {tools.map((t) => (
                <ToolTile key={t.id} tool={t} />
              ))}
            </div>
          </div>
        </div>

        <div role="grid" aria-label={`${PERSONA.name}: tools by jobs`} onKeyDown={nav.onKeyDown}>
          <div role="row" className={`${ROW_GRID} hidden md:grid`}>
            <SpineSegment lit={lit} beat={0} node={false} />
            <span role="columnheader" className={`${LABEL} pb-1`}>Tool</span>
            <span role="columnheader" aria-colspan={3} className={`${LABEL} pb-1 md:col-span-3`}>
              Jobs it takes on
            </span>
          </div>
          {tools.map((tool, row) => (
            <MatrixRow
              key={tool.id}
              tool={tool}
              row={row}
              last={row === tools.length - 1}
              lit={lit}
              active={nav.active}
              shown={nav.shown}
              register={register}
              onChoose={setActive}
              onPreview={setPreview}
            />
          ))}
        </div>

        {/* Readout: the chosen or hovered job, in full. Reserved height. */}
        <div className="mt-3 grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 border-t border-glass pt-3">
          <div className="flex justify-center pt-0.5">
            <ToolTile tool={nav.tool} />
          </div>
          <div className="min-h-[76px] min-w-0 sm:min-h-[52px]" aria-live="polite">
            <p className="text-[13px] font-semibold text-foreground">
              {nav.job.title}
              <span className="ml-2 rounded-md border border-glass px-1.5 py-0.5 font-mono text-xs font-normal text-muted">
                {PERSONA.name} · {nav.tool.name}
              </span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted sm:text-[13px]">{nav.job.desc}</p>
          </div>
        </div>
      </div>
      <figcaption className="mt-4 text-center text-sm text-muted">
        Every row is the same persona: one name, one colour, one card. Only the tool changes.
        <span className="hidden text-muted-dark sm:inline"> Hover or focus a job to read it.</span>
      </figcaption>
    </figure>
  );
}
