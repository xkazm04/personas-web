"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, PROJECTS, WORST } from "./copy";
import type { Rect } from "./layout";
import { DrawCheck, Part, Sheen, Slot } from "./parts";

/**
 * What the project turns out to be, once you are close enough to see it.
 *
 * This is the payoff the whole camera move exists for, so it does not arrive
 * as a card: it composes in the same layers as the field did. The frame and
 * the name land first, then the dimensions that are NOT fine — each with the
 * only thing that matters about them, how long it has been like that — then
 * the one specific finding in plain words, and only then the fix, which
 * beckons for a beat before it commits.
 *
 * The footnote is deliberate. Every project carries many health dimensions
 * and almost all of them are always fine; naming the two that are not, and
 * counting the rest in five words, is the difference between a report and a
 * status page.
 *
 * It lives in SCREEN space at the projected position of its plot, so its
 * type renders at the authored size no matter how far the camera came down.
 */
export default function NearPanel({
  rect,
  stem,
  stage,
  beckon,
  open,
  reduced,
}: {
  rect: Rect;
  /** Screen line from the plot's bottom edge down to the panel, when there
   *  is one — it is what keeps the detail attached to the terrain. */
  stem: { x: number; y: number; h: number } | null;
  stage: ModuleStage;
  beckon: boolean;
  open: boolean;
  reduced: boolean;
}) {
  const c = COPY.panel;
  const shell = atStage(stage, "shell");
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const done = atStage(stage, "chosen");

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${reduced ? "" : "transition-opacity duration-500"}`}
      style={{ opacity: open ? 1 : 0 }}
      aria-hidden="true"
    >
      {stem && shell && (
        <span
          className="absolute w-px"
          style={{
            left: `${stem.x}%`,
            top: `${stem.y}%`,
            height: `${stem.h}%`,
            backgroundColor: tint(done ? "emerald" : "rose", 50),
          }}
        />
      )}

      <Slot
        rect={rect}
        solid={shell}
        waiting={false}
        reduced={reduced}
        round="rounded-2xl"
        className="flex flex-col gap-1.5 overflow-hidden px-3.5 py-2.5 backdrop-blur-md sm:px-5 sm:py-3"
        style={{
          borderColor: tint(done ? "emerald" : "rose", 45),
          backgroundColor: tint("cyan", 6),
          boxShadow: brandShadow(done ? "emerald" : "rose", 40, 18),
        }}
      >
        <Sheen on={done} reduced={reduced} />

        <span className="flex items-center gap-2">
          <Part
            show
            i={0}
            reduced={reduced}
            className="min-w-0 flex-1 truncate text-lg font-medium text-foreground sm:text-xl"
          >
            {PROJECTS[WORST].name}
          </Part>
          <Part
            show
            i={1}
            reduced={reduced}
            className="shrink-0 rounded-full border px-2.5 py-0.5 text-base"
            style={{ borderColor: tint("rose", 40), color: BRAND_VAR.rose }}
          >
            {c.badge}
          </Part>
        </span>

        {/* Only what is not fine */}
        {c.rows.map((row, i) => (
          <Part
            key={row.name}
            show={body}
            i={i}
            reduced={reduced}
            className="flex items-center gap-2"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.rose, boxShadow: brandShadow("rose", 6, 70) }}
            />
            <span className="min-w-0 truncate text-base text-foreground">{row.name}</span>
            <span className={`ml-auto shrink-0 truncate normal-case ${ANNOTATION_DIM}`}>
              {row.since}
            </span>
          </Part>
        ))}

        {/* The one thing she actually found */}
        <Part
          show={detail}
          reduced={reduced}
          className="rounded-r-lg border-l-2 py-1 pl-2.5 pr-1 text-base leading-snug text-foreground"
          style={{ borderColor: BRAND_VAR.rose, backgroundColor: tint("rose", 6) }}
        >
          <span className="hidden sm:inline">{c.finding}</span>
          <span className="sm:hidden">{c.findingShort}</span>
        </Part>

        <span className="mt-auto flex items-center gap-2">
          <Part show={detail} reduced={reduced} className="min-w-0 truncate text-base text-muted-dark">
            {c.rest}
          </Part>
          {(beckon || done) && (
            <motion.span
              className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-0.5 text-base"
              style={{
                borderColor: tint(done ? "emerald" : "cyan", done ? 50 : 55),
                backgroundColor: tint(done ? "emerald" : "cyan", done ? 12 : 16),
                color: BRAND_VAR[done ? "emerald" : "cyan"],
                boxShadow: done ? undefined : brandShadow("cyan", 18, 30),
              }}
              initial={reduced ? false : { opacity: 0, y: 4 }}
              animate={
                reduced || done
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 1, y: 0, scale: [1, 1.045, 1] }
              }
              transition={
                reduced || done
                  ? { duration: 0.25 }
                  : { scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" }, duration: 0.3 }
              }
            >
              {done && <DrawCheck reduced={reduced} className="h-4 w-4" />}
              <span className="hidden sm:inline">{done ? c.done : c.action}</span>
              <span className="sm:hidden">{done ? c.done : c.actionShort}</span>
            </motion.span>
          )}
        </span>
      </Slot>
    </div>
  );
}
