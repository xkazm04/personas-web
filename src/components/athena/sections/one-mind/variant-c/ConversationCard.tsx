"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { CONVERSATIONS } from "./copy";
import type { Rect } from "./layout";
import Memory from "./Memory";
import { BREATH, Chorus, Part, Slot } from "./parts";

/**
 * One conversation you have going.
 *
 * It composes in the shared layers: an outline holding its place, then the
 * frame, then its name, then what it is holding. What it is NEVER holding is
 * a status — a conversation is not a task, and the only thing that ever
 * happens to one here is that she takes what it knows.
 *
 * Three states past `live` matter, and they are all light rather than copy:
 *
 *   given    it has just handed over what it holds. A warm seam that settles
 *            rather than a badge — nothing was consumed, the conversation is
 *            still open, she simply already knew.
 *   sourced  a line of her answer is currently attached to this card. It wears
 *            the ring so the eye can follow claim -> hairline -> the thing it
 *            came from without being told to.
 *   together everything is on the shared BREATH with no offset from here on,
 *            so every card in the frame rises and falls as one thing.
 */

const LIT = { border: 34, fill: 8 };
const IDLE = { border: 18, fill: 4 };

export default function ConversationCard({
  index,
  rect,
  stage,
  sourced,
  chorus,
  together,
  reduced,
}: {
  index: number;
  rect: Rect;
  stage: ModuleStage;
  sourced: boolean;
  chorus: boolean;
  together: boolean;
  reduced: boolean;
}) {
  const convo = CONVERSATIONS[index];
  const solid = atStage(stage, "shell");
  const named = atStage(stage, "body");
  const live = atStage(stage, "detail");
  const given = atStage(stage, "chosen");
  const tone = live ? LIT : IDLE;

  // Its own tempo while the conversation is going; the SHARED tempo, with no
  // per-card offset, from the one-voice beat on. That switch — six lights that
  // were blinking out of step falling into step — is the closing image.
  const beating = live && !reduced;
  const pulse = beating ? (together ? [0.9, 0.4, 0.9] : [1, 0.3, 1]) : null;
  const beat = !beating
    ? { duration: 0.3 }
    : together
      ? BREATH
      : { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const, delay: index * 0.17 };

  return (
    <>
      {sourced && (
        <motion.span
          className="pointer-events-none absolute rounded-2xl border"
          style={{
            left: `${rect.x - 1.1}%`,
            top: `${rect.y - 1.2}%`,
            width: `${rect.w + 2.2}%`,
            height: `${rect.h + 2.4}%`,
            borderColor: tint("cyan", 34),
            boxShadow: brandShadow("cyan", 20, 16),
          }}
          initial={reduced ? false : { opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}

      <Slot
        rect={rect}
        solid={solid}
        waiting
        reduced={reduced}
        className="flex flex-col gap-1 overflow-hidden px-2.5 py-2 backdrop-blur-sm"
        style={{
          borderColor: tint("cyan", given ? 44 : tone.border),
          backgroundColor: tint("cyan", given ? 9 : tone.fill),
          boxShadow: given ? brandShadow("cyan", 22, 14) : undefined,
        }}
      >
        <Chorus on={chorus} reduced={reduced} />

        <span className="flex shrink-0 items-center gap-2">
          <Part
            show={named}
            reduced={reduced}
            className="min-w-0 flex-1 truncate text-base text-foreground"
          >
            {convo.name}
          </Part>
          {/* It is going right now — and during the hold every one of these
              settles onto the same slow breath at the same instant. */}
          <motion.span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            initial={false}
            animate={{ opacity: pulse ?? (live ? 1 : 0) }}
            transition={beat}
            aria-hidden="true"
          />
        </span>

        {/* What this one is holding, at watermark strength */}
        <Part show={live} lead={0.08} reduced={reduced} className="min-h-0 flex-1">
          <Memory glyph={convo.glyph} className="h-full w-full" />
        </Part>
      </Slot>
    </>
  );
}
