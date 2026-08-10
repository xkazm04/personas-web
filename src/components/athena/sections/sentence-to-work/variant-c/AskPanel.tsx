"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, type Rect } from "./data";
import { DrawCheck, FieldBlock, Part, Sheen } from "./parts";

/**
 * What you said, and what she offered back — the left-hand plate on the ground,
 * and the only part of this section where you are still in the room.
 *
 * It composes in five beats. The plate solidifies out of its ghost; your one
 * plain sentence lands in it; the two ways in light up together, because
 * saying it and typing it are the same road; her plan arrives as three lines
 * with your pencil already on them; and then — only then — you say go, and the
 * go is a drawn check and a sweep of light rather than a flag flipping.
 *
 * Nothing on the field starts before that beat. That is the point of the beat.
 *
 * While you are away the plate stays exactly where it is, just quieter: the
 * thing you left behind, still holding the words you left it with.
 */
export function AskPanel({
  rect,
  ask,
  plan,
  dim,
  reduced,
}: {
  rect: Rect;
  ask: ModuleStage;
  plan: ModuleStage;
  dim: boolean;
  reduced: boolean;
}) {
  const c = COPY.ask;
  const MicIcon = c.micIcon;
  const KeysIcon = c.keysIcon;
  const EditIcon = c.editIcon;
  const said = atStage(ask, "body");
  const ways = atStage(ask, "detail");
  const offered = atStage(plan, "shell");
  const lines = atStage(plan, "body");
  const editable = atStage(plan, "detail");
  const confirmed = atStage(plan, "chosen");

  return (
    <FieldBlock
      rect={rect}
      stage={ask}
      reduced={reduced}
      dim={dim}
      accent={confirmed}
      className="flex flex-col gap-2 px-4 py-3"
    >
      <Sheen on={confirmed} reduced={reduced} delay={0.12} />

      {/* Spoken or typed — one road in, so both glyphs light at once. */}
      <span className="flex h-6 shrink-0 items-center gap-2">
        <Part show={ways} reduced={reduced} className="flex items-center gap-1.5 text-brand-cyan">
          <MicIcon className="h-4 w-4" aria-hidden="true" />
          <KeysIcon className="h-4 w-4" aria-hidden="true" />
        </Part>
        <Part show={ways} i={1} reduced={reduced} className={`normal-case ${ANNOTATION_DIM}`}>
          {c.waysLabel}
        </Part>
      </span>

      {/* The sentence. One of them. That is the whole ask. */}
      <span className="flex min-h-7 shrink-0">
        <Part
          show={said}
          reduced={reduced}
          className="text-base font-medium leading-snug text-foreground sm:text-lg"
        >
          {c.request}
        </Part>
      </span>

      <span
        className="h-px w-full shrink-0"
        style={{ backgroundColor: "var(--border-glass)" }}
        aria-hidden="true"
      />

      <span className="flex h-6 shrink-0 items-baseline gap-2">
        <Part show={offered} reduced={reduced} className="text-base font-semibold text-foreground">
          {c.planLabel}
        </Part>
        <Part
          show={editable}
          i={1}
          reduced={reduced}
          className="ml-auto flex items-center gap-1.5 text-base text-muted-dark"
        >
          <EditIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {c.planHint}
        </Part>
      </span>

      {/* Her three lines. Every row holds its own height from the start, so the
          cascade can never move the one above it. */}
      <span className="flex min-h-0 flex-1 flex-col gap-1">
        {c.plan.map((line, i) => (
          <span key={line} className="flex h-6 shrink-0 items-center">
            <Part
              show={lines}
              i={i}
              reduced={reduced}
              className="flex w-full items-center gap-2.5"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: tint("cyan", 60) }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-base text-foreground">{line}</span>
              <span className="flex h-4 w-4 shrink-0 items-center justify-center text-muted-dark">
                {editable && <EditIcon className="h-3.5 w-3.5" aria-hidden="true" />}
              </span>
            </Part>
          </span>
        ))}
      </span>

      {/* The go. Offered first, taken second — a moment, not a flag. */}
      <span className="flex h-8 shrink-0 items-center">
        {confirmed ? (
          <Part
            show
            reduced={reduced}
            className="flex items-center gap-2 rounded-full border px-3 py-1 text-base"
            style={{
              borderColor: tint("cyan", 55),
              backgroundColor: tint("cyan", 12),
              color: BRAND_VAR.cyan,
            }}
          >
            <DrawCheck reduced={reduced} />
            {c.confirmed}
          </Part>
        ) : (
          editable && (
            <motion.span
              className="flex items-center rounded-full border border-glass-hover bg-surface px-3 py-1 text-base text-foreground"
              initial={reduced ? false : { opacity: 0, y: 4 }}
              animate={reduced ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: [1, 1.035, 1] }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }, duration: 0.4 }
              }
            >
              {c.confirm}
            </motion.span>
          )
        )}
      </span>
    </FieldBlock>
  );
}
