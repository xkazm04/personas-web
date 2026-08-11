"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION, ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { SCENE } from "../copy";
import type { Rect } from "../layout";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { Part } from "./parts";
import { TargetPanel } from "./shell";

/**
 * The schedule module — a real scheduler, not a caption. It frames up while
 * she crosses, the schedule line lands as she arrives (body), and the weekday
 * strip, timezone and edit affordance fill on the bracket lock (detail).
 *
 * It arrives EMPTY: no schedule, every day dark, the switch off. The third
 * choice is what fills it, and that beat is played out rather than flipped —
 * the weekdays light M→F in sequence, the schedule line resolves behind them,
 * and only then does the toggle throw. Nothing here moves layout: both rows
 * hold their height from the moment they exist, so only colors change.
 */

/** Both rows reserve their line box the moment they mount, so the panel's
 *  centered column can never shift as parts fill in. */
const ROW = "flex min-h-6 min-w-0 items-center";
/** Seconds between weekday cells lighting up, and the toggle's own wait. */
const DAY_STEP = 0.1;
const TOGGLE_WAIT = 0.58;

export function TriggerCard({
  rect,
  stage,
  locked,
  armed,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  locked: boolean;
  armed: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaPage.onboarding.canvas;
  const Clock = SCENE.canvas.triggerIcon;
  const Pencil = SCENE.canvas.triggerHintIcon;
  const voice = armed ? ANNOTATION : ANNOTATION_DIM;
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  return (
    <TargetPanel
      rect={rect}
      stage={stage}
      locked={locked}
      reduced={reduced}
      className="flex-col justify-center gap-2 px-3 py-2"
    >
      {body && (
        <span className={`${ROW} gap-2`}>
          <Part show i={0} reduced={reduced} className="flex shrink-0">
            <Clock
              className={`h-4.5 w-4.5 duration-500 transition-colors ${armed ? "text-brand-cyan" : "text-muted-dark"}`}
              aria-hidden="true"
            />
          </Part>
          <Part
            show
            i={1}
            reduced={reduced}
            className={`hidden min-w-0 truncate normal-case md:inline ${voice}`}
          >
            <Schedule armed={armed} reduced={reduced} long />
          </Part>
          <Part show i={1} reduced={reduced} className={`min-w-0 truncate normal-case md:hidden ${voice}`}>
            <Schedule armed={armed} reduced={reduced} />
          </Part>
          <Part show i={2} reduced={reduced} className="ml-auto flex shrink-0 items-center gap-2">
            <span className="hidden text-base text-muted-dark sm:block">
              {armed ? c.triggerOn : c.triggerOff}
            </span>
            <Toggle on={armed} reduced={reduced} />
          </Part>
        </span>
      )}

      {body && (
        <span className={`${ROW} gap-1.5`}>
          {c.triggerDays.map((day, i) => (
            <Part key={i} show={detail} i={i} reduced={reduced} className="flex shrink-0">
              <DayCell
                label={day}
                lit={armed && SCENE.canvas.triggerActiveDays.includes(i)}
                order={SCENE.canvas.triggerActiveDays.indexOf(i)}
              />
            </Part>
          ))}
          <Part show={detail} i={7} reduced={reduced} className="ml-auto hidden shrink-0 text-base text-muted-dark sm:block">
            {c.triggerZone}
          </Part>
          <Part show={detail} i={8} reduced={reduced} className="hidden shrink-0 items-center gap-1.5 text-base text-muted-dark lg:flex">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {c.triggerHint}
          </Part>
        </span>
      )}
    </TargetPanel>
  );
}

/** The schedule line — it resolves as the weekdays finish lighting, so the
 *  strip reads as the cause and the sentence as the consequence. */
function Schedule({ armed, reduced, long }: { armed: boolean; reduced: boolean; long?: boolean }) {
  const { t } = useTranslation();
  const c = t.athenaPage.onboarding.canvas;
  const set = long ? c.triggerValue : c.triggerValueShort;
  const idle = long ? c.triggerIdle : c.triggerIdleShort;
  return (
    <motion.span
      key={armed ? "set" : "idle"}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.35, delay: armed ? 0.42 : 0 }}
    >
      {armed ? set : idle}
    </motion.span>
  );
}

/** One weekday in the selector strip. The lit ones come up in sequence — a
 *  schedule being written across the week, not a row switching on. */
function DayCell({ label, lit, order }: { label: string; lit: boolean; order: number }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-base duration-500 transition-[background-color,border-color,color] ${
        lit ? "border-brand-cyan/40 text-brand-cyan" : "border-glass text-muted-dark"
      }`}
      style={{
        backgroundColor: lit ? tint("cyan", 14) : undefined,
        transitionDelay: lit ? `${Math.round(Math.max(order, 0) * DAY_STEP * 1000)}ms` : "0ms",
      }}
    >
      {label}
    </span>
  );
}

/** The enable switch — it throws only after the week has finished lighting. */
function Toggle({ on, reduced }: { on: boolean; reduced: boolean }) {
  const wait = on && !reduced ? `${Math.round(TOGGLE_WAIT * 1000)}ms` : "0ms";
  return (
    <span
      className={`relative block h-5 w-9 shrink-0 rounded-full duration-500 transition-[background-color,box-shadow] ${on ? "" : "bg-foreground/15"}`}
      style={{
        backgroundColor: on ? tint("cyan", 55) : undefined,
        boxShadow: on ? brandShadow("cyan", 12, 40) : undefined,
        transitionDelay: wait,
      }}
      aria-hidden="true"
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background transition-transform duration-500 ${on ? "translate-x-4" : ""}`}
        style={{ transitionDelay: wait }}
      />
    </span>
  );
}
