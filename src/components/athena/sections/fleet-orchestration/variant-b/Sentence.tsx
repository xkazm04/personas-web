"use client";

import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { STEP, atStage, stepDelay, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, REQUEST } from "./copy";
import type { Rect } from "./layout";
import { DrawCheck, Part, Slot } from "./parts";

/**
 * The request — one ordinary sentence, typed a clause per tick.
 *
 * Two things make this box carry the section's argument rather than decorate
 * it. First, the words are the SOURCE: every phrase that will become work is
 * a marked run inside this paragraph, and it lights in place at the exact
 * beat its task is derived, so the derivation is witnessed rather than
 * claimed. Second, the mic sits on the box the whole time the caret is
 * blinking — spoken and typed take the identical path, which is much easier
 * to show than to say.
 *
 * The highlight run carries its padding at all times (transparent when unlit)
 * so lighting a phrase can never reflow the sentence around it.
 */

/** Authored waveform — an organic shape still has to be deterministic. */
const WAVE = [0.35, 0.75, 0.5, 1, 0.6] as const;

function Waveform({ live, reduced }: { live: boolean; reduced: boolean }) {
  return (
    <span className="flex h-4 items-center gap-[3px]" aria-hidden="true">
      {WAVE.map((h, i) => (
        <motion.span
          className="w-[2px] rounded-full"
          key={i}
          style={{ height: `${h * 100}%`, backgroundColor: tint("cyan", 55) }}
          animate={live && !reduced ? { scaleY: [0.5, 1, 0.5] } : { scaleY: 1 }}
          transition={
            live && !reduced
              ? { duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}

/** Split a clause into words carrying their place in the clause's cascade.
 *  Pure: same clause in, same order out, every render. */
function wordsOf(index: number) {
  let n = 0;
  return REQUEST[index].map((seg) => ({
    seg,
    chunks: seg.t.split(/(\s+)/).map((chunk) => ({
      chunk,
      order: chunk.trim() === "" ? -1 : n++,
    })),
  }));
}

/** One clause. Words rise in sequence inside their own tick, so the sentence
 *  reads as being written rather than pasted. */
function ClauseLine({
  index,
  lit,
  reduced,
}: {
  index: number;
  lit: boolean[];
  reduced: boolean;
}) {
  return (
    <>
      {wordsOf(index).map(({ seg, chunks }, si) => {
        const on = seg.task !== undefined && lit[seg.task];
        return (
          <span
            key={si}
            // The highlight bleeds OUTSIDE its run (`-mx-1`) so lighting a
            // phrase adds no width — the sentence must not re-wrap mid-loop.
            className={
              seg.task === undefined
                ? undefined
                : "box-decoration-clone -mx-1 rounded-md px-1 duration-500 transition-[background-color,color,box-shadow]"
            }
            style={{
              backgroundColor: on ? tint("cyan", 15) : undefined,
              color: on ? BRAND_VAR.cyan : undefined,
              boxShadow: on ? brandShadow("cyan", 14, 22) : undefined,
            }}
          >
            {chunks.map(({ chunk, order }, ci) =>
              order < 0 ? (
                chunk
              ) : (
                <motion.span
                  key={ci}
                  className="inline-block"
                  initial={reduced ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduced ? { duration: 0 } : { duration: 0.32, delay: stepDelay(order, 0.04) }
                  }
                >
                  {chunk}
                </motion.span>
              ),
            )}
          </span>
        );
      })}
    </>
  );
}

export default function Sentence({
  rect,
  stage,
  clauses,
  lit,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  clauses: number;
  lit: boolean[];
  reduced: boolean;
}) {
  const shell = atStage(stage, "shell");
  const typing = atStage(stage, "body") && !atStage(stage, "chosen");
  const sent = atStage(stage, "chosen");
  return (
    <Slot
      rect={rect}
      solid={shell}
      waiting
      reduced={reduced}
      round="rounded-2xl"
      className="flex flex-col gap-2 overflow-hidden px-4 py-3 backdrop-blur-md sm:px-6"
      style={{
        borderColor: sent ? tint("cyan", 45) : undefined,
        backgroundColor: tint("cyan", sent ? 7 : 3),
        boxShadow: sent ? brandShadow("cyan", 34, 16) : undefined,
      }}
    >
      {/* Type stops at text-lg on purpose: the box is a percent rect, so on a
          short viewport it shrinks while the words do not — and clipping the
          request would cost the section its whole premise. */}
      <p className="min-h-0 flex-1 overflow-hidden text-base leading-snug text-foreground sm:text-lg">
        {clauses === 0 ? (
          <span className="text-muted-dark">{COPY.request.placeholder}</span>
        ) : (
          Array.from({ length: clauses }, (_, i) => (
            <ClauseLine key={i} index={i} lit={lit} reduced={reduced} />
          ))
        )}
        {!sent && (
          <motion.span
            className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[0.1em] rounded-full align-baseline"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            animate={reduced ? undefined : { opacity: [1, 0.1, 1] }}
            transition={reduced ? undefined : { duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        )}
      </p>

      <span className="flex shrink-0 items-center gap-2.5">
        <Part show={shell} i={0} lead={STEP} reduced={reduced} className="flex items-center gap-2.5">
          <Mic className="h-4.5 w-4.5 text-brand-cyan" aria-hidden="true" />
          <Waveform live={typing} reduced={reduced} />
          <span className={`hidden normal-case sm:inline ${ANNOTATION_DIM}`}>
            {COPY.request.voice}
          </span>
        </Part>
        {sent && (
          <Part
            show
            reduced={reduced}
            className="ml-auto flex items-center gap-1.5 text-base text-brand-cyan"
          >
            <DrawCheck reduced={reduced} className="h-4 w-4" />
            {COPY.request.sent}
          </Part>
        )}
      </span>
    </Slot>
  );
}
