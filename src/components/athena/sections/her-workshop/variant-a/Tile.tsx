"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, type Job } from "./copy";
import type { TileState } from "./data";
import type { Rect } from "./layout";
import { inkModeOf, lookOf, railStripe } from "./look";
import { DrawCheck, Ping } from "./ink";
import { Part, Slot } from "./parts";
import Texture from "./Texture";

/**
 * One screen on the wall.
 *
 * It composes in the shared four layers, and here each layer is a different
 * claim. The SHELL is that this piece of work exists and has a name someone
 * would recognise. The BODY is its output — the only evidence anything in this
 * section is decided on. The DETAIL is the live mark that says output is still
 * arriving. And CHOSEN is the moment she has read it, which is why every screen
 * on this wall commits at the same tick: she does not walk the wall, she takes
 * it in one pass, and the answers land together or the section is lying.
 *
 * Before that moment a screen carries no verdict colour at all. It is running,
 * she simply has not said anything about it yet — and a wall that pre-coloured
 * its answers would give away the one beat it exists to deliver.
 */
export default function Tile({
  rect,
  job,
  index,
  stage,
  state,
  dim,
  batch,
  lines,
  chipDot,
  at,
  sweeping,
  reduced,
}: {
  rect: Rect;
  job: Job;
  index: number;
  stage: ModuleStage;
  state: TileState;
  dim: boolean;
  /** One of the three pieces of a single job — marked, never labelled. */
  batch: boolean;
  lines: number;
  chipDot: boolean;
  /** How far across the wall this screen sits, 0…1. */
  at: number;
  sweeping: boolean;
  reduced: boolean;
}) {
  const shell = atStage(stage, "shell");
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const read = atStage(stage, "chosen");
  const look = lookOf(state, dim);
  const mode = inkModeOf(state);
  const live = mode === "running";
  const word = COPY.state[state === "dark" ? "working" : state];

  return (
    <Slot
      rect={rect}
      solid={shell}
      waiting
      reduced={reduced}
      delay={at * 0.42}
      className={`flex flex-col gap-1 overflow-hidden px-1.5 py-1.5 backdrop-blur-sm sm:px-2.5 ${
        look.dashed ? "border-dashed" : ""
      }`}
      style={{
        borderColor: look.border,
        backgroundColor: look.background,
        boxShadow: look.boxShadow,
      }}
    >
      <Ping on={sweeping} at={at} reduced={reduced} />

      {/* The three pieces of one job wear the same rail, and the announcement
          they end in wears it too. It is a SHAPE and not just a colour on
          purpose: this page is themed, a hue can land next to its neighbour in
          some palettes, and a stitched edge reads as the same edge in all of
          them. No word is spent naming the group. */}
      {batch && (
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{ backgroundImage: railStripe(dim) }}
          aria-hidden="true"
        />
      )}

      <Part show i={0} reduced={reduced} className="flex min-w-0 shrink-0 items-center gap-1.5">
        <span
          className={`min-w-0 flex-1 truncate font-mono text-base leading-snug ${
            dim ? "text-muted-dark" : "text-foreground"
          }`}
        >
          {job.name}
        </span>
        {/* Output is arriving. Narrow screens drop it — the line still being
            written inside carries the same claim, and a name that truncates to
            make room for a dot is a worse trade than no dot. */}
        {chipDot && detail && live && !reduced && (
          <motion.span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: tint(look.accent, 70) }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: at }}
            aria-hidden="true"
          />
        )}
      </Part>

      {body && (
        <Texture
          job={index}
          lines={lines}
          mode={mode}
          look={look}
          showCaret={chipDot}
          reduced={reduced}
        />
      )}

      {/* Her verdict. It arrives on every screen in the same instant, with no
          per-screen offset at all — the simultaneity is the argument. */}
      {read && (
        <Part
          show
          lead={0.05}
          reduced={reduced}
          className="flex shrink-0 items-center gap-1.5 font-mono text-base leading-snug"
          style={{ color: dim ? undefined : BRAND_VAR[look.accent] }}
        >
          {state === "done" ? (
            <span
              className={`flex shrink-0 ${dim ? "text-muted-dark" : ""}`}
              style={{ color: dim ? undefined : BRAND_VAR[look.accent] }}
            >
              <DrawCheck reduced={reduced} className="h-3.5 w-3.5" delay={0.1} />
            </span>
          ) : (
            chipDot && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: tint(look.accent, 70) }}
                aria-hidden="true"
              />
            )
          )}
          {/* A verdict changing is a moment, not a swap: when "no output"
              turns out to be four different things, the new word arrives
              rather than replacing the old one in place. */}
          <motion.span
            key={word}
            className={`min-w-0 truncate ${dim ? "text-muted-dark" : ""}`}
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
          >
            {word}
          </motion.span>
        </Part>
      )}
    </Slot>
  );
}
