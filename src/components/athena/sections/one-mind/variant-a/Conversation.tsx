"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, type BrandKey, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, type Conversation as Talk } from "./copy";
import type { ChipKey } from "./data";
import type { Rect } from "./layout";
import Message from "./Message";
import { DrawCheck, Part, Sheen, Slot } from "./parts";

/**
 * One conversation — its own place, with its own subject, its own last few
 * lines and its own state. Four of them differ in every way a place can
 * differ; what does not differ is who is on the other side of them.
 *
 * The header reserves a slot on the left whether she is in this conversation
 * or not. Empty it holds the state dot; occupied it holds HER — and because
 * there is exactly one of her in the whole scene, only one conversation can
 * ever be showing it. That reservation is also why she can never cover a word.
 *
 * Lines are never deleted, only scrolled past: the panel shows its most recent
 * few, bottom-anchored, so the newest thing said is always the thing fully in
 * view and the history behind it stays true.
 */

const ACCENT: Record<ChipKey, BrandKey | null> = {
  you: "amber",
  working: "cyan",
  quiet: null,
  home: null,
  here: "cyan",
  caught: "emerald",
  answered: "emerald",
};

export default function Conversation({
  rect,
  tilt,
  talk,
  stage,
  said,
  chip,
  active,
  marked,
  touched,
  unified,
  progress,
  compact,
  window: shown,
  reduced,
}: {
  rect: Rect;
  tilt: number;
  talk: Talk;
  stage: ModuleStage;
  said: number;
  chip: ChipKey;
  /** She is in this one right now. */
  active: boolean;
  /** This conversation's answer says where it learned the thing. */
  marked: boolean;
  /** Something learned elsewhere has just reached this one. */
  touched: boolean;
  unified: boolean;
  progress: number;
  compact: boolean;
  window: number;
  reduced: boolean;
}) {
  const shell = atStage(stage, "shell");
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const accent = ACCENT[chip];
  const done = chip === "caught" || chip === "answered";
  const lines = talk.lines.slice(Math.max(0, said - shown), said);
  const slot = compact ? "h-7 w-7" : "h-9 w-9";
  // Two different reasons for a conversation to light without her in it: one
  // is the beat something learned somewhere else arrives here, the other is
  // the close, when they all light together. Same treatment on purpose — both
  // are the same fact about them.
  const lifted = touched || unified;

  return (
    <Slot
      rect={rect}
      solid={shell}
      waiting
      reduced={reduced}
      tilt={tilt}
      round="rounded-2xl"
      className="flex flex-col gap-1.5 overflow-hidden px-2.5 py-2 backdrop-blur-sm sm:px-3"
      style={{
        borderColor: tint("cyan", active ? 48 : lifted ? 40 : 20),
        backgroundColor: tint("cyan", active ? 7 : lifted ? 5 : 4),
        boxShadow: active
          ? brandShadow("cyan", 34, 22)
          : lifted
            ? brandShadow("cyan", 28, 14)
            : undefined,
      }}
    >
      <Sheen on={active && !reduced} reduced={reduced} />

      <span className="flex shrink-0 items-center gap-2">
        {/* Her seat in this conversation. Held open either way. */}
        <span className={`flex shrink-0 items-center justify-center ${slot}`} aria-hidden="true">
          {!active && (
            <motion.span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: accent ? BRAND_VAR[accent] : tint("cyan", 35),
                boxShadow: accent ? brandShadow(accent, 8, 70) : undefined,
              }}
              animate={chip === "working" && !reduced ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
              transition={
                chip === "working" && !reduced
                  ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
            />
          )}
        </span>
        <Part show i={0} reduced={reduced} className="min-w-0 flex-1 truncate text-base text-foreground">
          {talk.subject}
        </Part>
        <Part
          show={detail}
          i={1}
          reduced={reduced}
          className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-base"
          style={{
            borderColor: accent ? tint(accent, 40) : tint("cyan", 20),
            color: accent ? BRAND_VAR[accent] : undefined,
          }}
        >
          {done && <DrawCheck reduced={reduced} className="h-3.5 w-3.5" />}
          <span className={accent ? undefined : "text-muted-dark"}>{COPY.state[chip]}</span>
        </Part>
      </span>

      {/* Bottom-anchored, so the newest line is the one that is always whole */}
      <span className="flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden">
        {body &&
          lines.map((line, i) => (
            <Message key={line.text} line={line} i={i} reduced={reduced} />
          ))}
      </span>

      {marked && (
        <Part show reduced={reduced} className="flex shrink-0 items-center justify-end gap-1.5">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 6, 70) }}
            aria-hidden="true"
          />
          <span className="truncate text-base text-muted-dark">
            {compact ? COPY.markShort : COPY.mark}
          </span>
        </Part>
      )}

      {talk.state === "working" && detail && (
        <span
          className="h-1 w-full shrink-0 overflow-hidden rounded-full"
          style={{ backgroundColor: tint("cyan", 12) }}
          aria-hidden="true"
        >
          <span
            className={`block h-full rounded-full ${reduced ? "" : "transition-[width] duration-[900ms] ease-linear"}`}
            style={{
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: BRAND_VAR.cyan,
              boxShadow: brandShadow("cyan", 8, 50),
            }}
          />
        </span>
      )}
    </Slot>
  );
}
