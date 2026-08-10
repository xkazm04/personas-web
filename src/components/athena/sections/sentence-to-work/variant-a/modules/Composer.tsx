"use client";

import { motion } from "framer-motion";
import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, TYPE_SECONDS } from "../data";
import type { Rect } from "../layout";
import { Chip } from "./primitives";
import { DrawCheck, Part, Sheen } from "./parts";
import { TargetPanel } from "./shell";

/**
 * The request bar — one sentence, in your own words, and that is the whole
 * input. It frames up while she crosses to it (shell), the sentence WRITES
 * ITSELF as she lands (body), the microphone, its little waveform and the
 * attached sources fill on the lock (detail), and handing it over is a
 * choreographed beat: a check draws inside the send control while an accent
 * sweeps the bar (chosen).
 *
 * The waveform is a hint, not a voice UI: it says a spoken request would take
 * this identical path, and then gets out of the way.
 */

/** Resting heights of the waveform bars, as percentages. Precomputed — React
 *  19 forbids `Math.random` in render, and a loop must look the same twice. */
const WAVE = [38, 72, 100, 56, 88, 44, 66] as const;

export function Composer({
  rect,
  stage,
  locked,
  reduced,
  epoch,
}: {
  rect: Rect;
  stage: ModuleStage;
  locked: boolean;
  reduced: boolean;
  /** Changes at every loop top and re-entry, which re-arms the typing. */
  epoch: number;
}) {
  const c = COPY.composer;
  const Mic = c.micIcon;
  const Send = c.sendIcon;
  const typing = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const sent = atStage(stage, "chosen");
  return (
    <TargetPanel
      rect={rect}
      stage={stage}
      locked={locked}
      marked={sent}
      reduced={reduced}
      className="flex-col justify-center gap-1.5 px-3.5 py-2"
    >
      <Sheen on={sent} reduced={reduced} />

      <span className="flex min-h-6 min-w-0 shrink-0 items-center gap-2">
        <Part show reduced={reduced} className={`shrink-0 normal-case ${ANNOTATION_DIM}`}>
          {c.label}
        </Part>
        {c.context.map((src, i) => (
          <Part
            show={detail}
            key={src.label}
            i={i}
            lead={0.1}
            reduced={reduced}
            className={`min-w-0 ${i === 0 ? "ml-auto" : ""} hidden lg:flex`}
          >
            <Chip icon={<ConnectorIcon src={src.glyph} size={14} />}>{src.label}</Chip>
          </Part>
        ))}
      </span>

      <span className="flex min-h-8 min-w-0 shrink-0 items-center gap-2.5">
        <Part show={detail} reduced={reduced} className="hidden shrink-0 items-center gap-2 sm:flex">
          <Mic className="h-4.5 w-4.5 shrink-0 text-brand-cyan" aria-hidden="true" />
          <Waveform reduced={reduced} />
        </Part>
        <TypedLine active={typing} sent={sent} epoch={epoch} reduced={reduced} />
        <Part show={detail} lead={0.24} reduced={reduced} className={`hidden shrink-0 xl:block ${ANNOTATION_DIM}`}>
          {c.voiceHint}
        </Part>
        <motion.span
          className="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-base font-semibold leading-none duration-500 transition-[background-color,border-color,color]"
          style={{
            borderColor: typing ? BRAND_VAR.cyan : tint("cyan", 30),
            backgroundColor: sent ? BRAND_VAR.cyan : "transparent",
            color: sent ? "var(--color-background)" : typing ? BRAND_VAR.cyan : "var(--color-muted-dark)",
            boxShadow: sent ? brandShadow("cyan", 20, 30) : "none",
          }}
          initial={false}
          animate={{ scale: sent && !reduced ? [1, 1.08, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >
          {sent ? (
            <DrawCheck reduced={reduced} className="h-4 w-4" delay={0.1} />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{sent ? c.sent : c.send}</span>
        </motion.span>
      </span>
    </TargetPanel>
  );
}

/** The sentence writing itself. The reveal is a clip over a full-width sizer,
 *  so the line never reflows and the caret rides the clip's own edge — no
 *  second animation to keep in sync, and nothing on the layout thread. */
function TypedLine({
  active,
  sent,
  epoch,
  reduced,
}: {
  active: boolean;
  sent: boolean;
  epoch: number;
  reduced: boolean;
}) {
  const c = COPY.composer;
  if (!active) {
    return (
      <span className="min-w-0 flex-1 truncate text-lg text-muted-dark">{c.placeholder}</span>
    );
  }
  return (
    <span className="relative min-w-0 flex-1 overflow-hidden">
      <span className="invisible block whitespace-nowrap text-lg" aria-hidden="true">
        {c.request}
      </span>
      <motion.span
        key={epoch}
        className="absolute inset-y-0 left-0 overflow-hidden"
        initial={reduced ? false : { width: "0%" }}
        animate={{ width: "100%" }}
        transition={reduced ? { duration: 0 } : { duration: TYPE_SECONDS, ease: "linear" }}
      >
        <span className="block whitespace-nowrap text-lg text-foreground">{c.request}</span>
        {!sent && !reduced && (
          <motion.span
            className="absolute inset-y-1 right-0 w-0.5 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />
        )}
      </motion.span>
    </span>
  );
}

/** Seven bars breathing beside the microphone — the hint that a spoken
 *  request lands in exactly this box. Still under reduced motion. */
function Waveform({ reduced }: { reduced: boolean }) {
  return (
    <span className="flex h-4 shrink-0 items-center gap-0.5" aria-hidden="true">
      {WAVE.map((h, i) => (
        <motion.span
          key={i}
          className="w-0.5 origin-center rounded-full"
          style={{ height: `${h}%`, backgroundColor: tint("cyan", 55) }}
          animate={reduced ? undefined : { scaleY: [1, 0.4, 1] }}
          transition={
            reduced
              ? undefined
              : { duration: 1.2 + i * 0.09, repeat: Infinity, ease: "easeInOut", delay: i * 0.07 }
          }
        />
      ))}
    </span>
  );
}
