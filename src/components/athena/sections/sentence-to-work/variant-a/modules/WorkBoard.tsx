"use client";

import { motion } from "framer-motion";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY } from "../data";
import type { Rect } from "../layout";
import { DrawCheck, Flash, Part } from "./parts";
import { Dot, ProgressBar, StatePill } from "./primitives";
import { PanelHeader, TargetPanel } from "./shell";

/** Seconds between one tile igniting and the next — and between one finishing
 *  and the next. Both cascades finish well inside their own 900ms beat. */
const TILE_STEP = 0.13;

/**
 * The board where one sentence turns into several things happening at the same
 * time. It frames up the moment the work is started and she turns toward it
 * (shell), the tiles land one after another as she arrives (body), their bars
 * start creeping on the lock (detail), and they finish in the same staggered
 * order they started (chosen) — so the board is never a row of switches
 * flipping together.
 */
export function WorkBoard({
  rect,
  stage,
  locked,
  compact,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  locked: boolean;
  compact: boolean;
  reduced: boolean;
}) {
  const c = COPY.board;
  return (
    <TargetPanel
      rect={rect}
      stage={stage}
      locked={locked}
      reduced={reduced}
      className="flex-col justify-start px-3.5 py-2.5"
    >
      <PanelHeader title={c.title} hint={compact ? c.hintCompact : c.hint} reduced={reduced} />
    </TargetPanel>
  );
}

/**
 * One piece of the work, placed over the board at its own rect. Every tile
 * says what it is doing in plain words and shows how far along it is; none of
 * them waits for another.
 */
export function WorkTile({
  rect,
  tile,
  index,
  stage,
  reduced,
}: {
  rect: Rect;
  tile: (typeof COPY.board.tiles)[number];
  index: number;
  stage: ModuleStage;
  reduced: boolean;
}) {
  const c = COPY.board;
  const body = atStage(stage, "body");
  const running = atStage(stage, "detail");
  const done = atStage(stage, "chosen");
  const lead = index * TILE_STEP;
  return (
    <TargetPanel
      rect={rect}
      stage={stage}
      from="body"
      ghost={false}
      lead={lead}
      locked={false}
      marked={done}
      reduced={reduced}
      className="items-center gap-2 px-2.5 py-1"
    >
      <Flash on={done} reduced={reduced} delay={lead} />
      <Part show={body} lead={lead} reduced={reduced} className="flex shrink-0">
        <Dot accent={done ? "emerald" : "cyan"} pulse={running && !done} reduced={reduced} />
      </Part>
      <Part
        show={body}
        i={1}
        lead={lead}
        reduced={reduced}
        className="min-w-0 flex-1 truncate text-base text-foreground"
      >
        {tile.label}
      </Part>
      <Part show={running} lead={lead} reduced={reduced} className="hidden shrink-0 lg:flex">
        <ProgressBar
          fill={tile.fill}
          running={running}
          done={done}
          reduced={reduced}
          delay={lead}
        />
      </Part>
      <Part show={running} i={1} lead={lead} reduced={reduced} className="hidden shrink-0 sm:flex">
        <TileState working={c.working} done={c.done} finished={done} lead={lead} reduced={reduced} />
      </Part>
    </TargetPanel>
  );
}

/** The tile's state, keyed on the word it is showing so "working" is replaced
 *  by a check that draws rather than by a label that swaps. */
function TileState({
  working,
  done,
  finished,
  lead,
  reduced,
}: {
  working: string;
  done: string;
  finished: boolean;
  lead: number;
  reduced: boolean;
}) {
  return (
    <motion.span
      key={finished ? "done" : "working"}
      className="flex"
      initial={reduced ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: lead }}
    >
      {finished ? (
        <StatePill
          tone="ok"
          label={done}
          glyph={<DrawCheck reduced={reduced} className="h-3.5 w-3.5" delay={lead + 0.1} />}
        />
      ) : (
        <StatePill tone="brand" label={working} pulse reduced={reduced} />
      )}
    </motion.span>
  );
}
