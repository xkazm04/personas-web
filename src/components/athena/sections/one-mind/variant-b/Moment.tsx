"use client";

import { motion } from "framer-motion";
import { MessagesSquare } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import Bubble from "./Bubble";
import { COPY, type Moment as MomentCopy } from "./copy";
import type { Rect } from "./layout";
import { Part, Slot } from "./parts";

/**
 * One conversation, on one day.
 *
 * It is an ordinary chat and it is meant to look like nothing: a subject, a
 * few messages, a box to type in. The only thing that is ever remarkable
 * inside it is a run of words that is lit — either because it is the thing you
 * said, or because it is the part of her answer that could only be right if
 * she still had it.
 *
 * `mood` is the section's clock. `live` is the day you are in, `past` is a
 * conversation the days have moved on from, and `calm` is the end, where all
 * three read at one strength because they were never really apart. Nothing
 * about a past conversation dims its TEXT — it is still there and still hers;
 * what recedes is the light around it.
 */

export type Mood = "live" | "past" | "calm";

const SKIN: Record<Mood, { border: number; fill: number; glow: number }> = {
  live: { border: 42, fill: 8, glow: 34 },
  past: { border: 11, fill: 2, glow: 0 },
  calm: { border: 28, fill: 5, glow: 18 },
};

/** The box you type in — furniture, in every conversation, which is the only
 *  reason the draft appearing in one of them reads as ordinary. */
function Composer({
  draft,
  showing,
  live,
  reduced,
  className,
}: {
  draft: string | undefined;
  showing: boolean;
  live: boolean;
  reduced: boolean;
  className: string;
}) {
  return (
    <span
      className={`mt-auto shrink-0 items-center gap-1.5 overflow-hidden rounded-xl border px-2.5 py-1.5 duration-500 transition-[border-color] ${className}`}
      style={{ borderColor: tint("cyan", showing ? 34 : 14) }}
    >
      <span className="relative min-w-0 flex-1">
        <span
          className={`block truncate text-base text-muted-dark ${reduced ? "" : "transition-opacity duration-500"}`}
          style={{ opacity: showing ? 0 : 1 }}
        >
          {COPY.composer}
        </span>
        {draft && (
          <span
            className={`absolute inset-0 truncate text-base ${reduced ? "" : "transition-opacity duration-500"}`}
            style={{ opacity: showing ? 1 : 0, color: BRAND_VAR.cyan }}
          >
            {draft}
          </span>
        )}
      </span>
      <motion.span
        className="h-4 w-px shrink-0 rounded-full"
        style={{ backgroundColor: BRAND_VAR.cyan }}
        animate={live && !reduced ? { opacity: [1, 0.1, 1] } : { opacity: 0.35 }}
        transition={
          live && !reduced ? { duration: 1.05, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }
        }
        aria-hidden="true"
      />
    </span>
  );
}

export default function Moment({
  rect,
  copy,
  stage,
  mood,
  lit,
  pulse,
  draft,
  reduced,
}: {
  rect: Rect;
  copy: MomentCopy;
  stage: ModuleStage;
  mood: Mood;
  lit: boolean;
  pulse: number | null;
  draft: boolean;
  reduced: boolean;
}) {
  const skin = SKIN[mood];
  return (
    <Slot
      rect={rect}
      solid={atStage(stage, "shell")}
      reduced={reduced}
      className="flex flex-col gap-1.5 overflow-hidden px-2.5 py-1.5 backdrop-blur-md sm:px-3 md:py-2"
      style={{
        borderColor: tint("cyan", skin.border),
        backgroundColor: tint("cyan", skin.fill),
        boxShadow: skin.glow ? brandShadow("cyan", 30, skin.glow) : undefined,
      }}
    >
      <Part show i={0} reduced={reduced} className={`flex shrink-0 items-center gap-1.5 ${ANNOTATION_DIM}`}>
        <MessagesSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
        {copy.subject}
      </Part>

      {/* Messages hug the composer and the scrollback above them stays empty —
          which is what a conversation you only just opened actually looks
          like, and it is what keeps a three-message day from floating in the
          middle of its own panel. */}
      <span className="flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-hidden">
        {copy.lines.map((line, i) =>
          atStage(stage, line.at) ? (
            <Part
              key={i}
              show
              i={i}
              reduced={reduced}
              className={line.wideOnly ? "hidden flex-col md:flex" : "flex flex-col"}
            >
              <Bubble
                line={line}
                lit={lit}
                pulse={pulse}
                sheen={line.who === "her" && line.at === "detail"}
                reduced={reduced}
              />
            </Part>
          ) : null,
        )}
      </span>

      <Composer
        draft={copy.draft}
        showing={draft}
        live={mood === "live"}
        reduced={reduced}
        className={copy.composerOnCompact ? "flex" : "hidden md:flex"}
      />
    </Slot>
  );
}
