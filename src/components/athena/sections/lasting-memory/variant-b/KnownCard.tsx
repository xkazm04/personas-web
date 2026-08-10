"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, KNOWN } from "./copy";
import type { KnownGeom } from "./layout";
import { BREATH, Part, rectStyle, Sheen, Slot, Wash } from "./parts";

/**
 * One durable thing she knows.
 *
 * The card wears exactly two states, and the difference between them is the
 * section. IN USE: lit, a live dot, full-strength type. AT REST: no glow, no
 * dot, and type at the page's muted colour — dimmer, never thinner, and
 * never below the contrast floor, because a memory you cannot read is a
 * memory that was thrown away.
 *
 * Going quiet and going down are deliberately two separate beats. The light
 * leaves first, while the card is still standing in the lit band; only on
 * the NEXT beat does it settle. Nothing is ever dimmed and moved in the same
 * gesture, so a viewer cannot mistake the second for a consequence of losing
 * the first.
 *
 * The card that settles keeps the box the whole loop and travels by
 * transform, so its citation cannot lose it. Where it stood, a waiting
 * outline stays open: the lit band really did get roomier, which is the
 * other half of the promise and the only thing in the frame that is allowed
 * to look like an absence.
 */

const IN_USE = { border: 52, fill: 12 };
const REST = { border: 15, fill: 3 };
const NAMED_TONE = { border: 38, fill: 6 };

/** A mark that lands on a card. Never a status, never a verdict — the two it
 *  can carry both say the card is staying exactly where it is. */
function Chip({
  children,
  reduced,
  strong = false,
}: {
  children: ReactNode;
  reduced: boolean;
  strong?: boolean;
}) {
  return (
    <motion.span
      className="shrink-0 truncate rounded-full border px-2.5 py-0.5 text-base"
      style={{
        borderColor: tint("cyan", strong ? 44 : 26),
        backgroundColor: tint("cyan", strong ? 12 : 6),
      }}
      initial={reduced ? false : { opacity: 0, scale: 0.86 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0 } : SPRING_POP}
    >
      {children}
    </motion.span>
  );
}

export default function KnownCard({
  geom,
  stage,
  ghost,
  atRest,
  quiet,
  arriving,
  stillHere,
  announced,
  leftAlone,
  named,
  wash,
  together,
  reduced,
}: {
  geom: KnownGeom;
  stage: ModuleStage;
  ghost: boolean;
  atRest: boolean;
  quiet: boolean;
  arriving: boolean;
  stillHere: boolean;
  announced: boolean;
  leftAlone: boolean;
  named: boolean;
  wash: boolean;
  together: boolean;
  reduced: boolean;
}) {
  const known = KNOWN[geom.i];
  const solid = atStage(stage, "shell");
  const said = atStage(stage, "body");
  const settled = atRest && geom.drop > 0;
  const tone = quiet ? (named && announced ? NAMED_TONE : REST) : IN_USE;
  const depth = geom.rect.y + (settled ? geom.drop : 0);

  return (
    <>
      {/* The room that opened up where it used to stand */}
      <motion.span
        className="pointer-events-none absolute rounded-xl border border-dashed"
        style={{ ...rectStyle(geom.rect), borderColor: tint("cyan", 17) }}
        initial={false}
        animate={{ opacity: settled ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.6, delay: settled && !reduced ? 0.3 : 0 }}
        aria-hidden="true"
      />

      <Slot
        rect={geom.rect}
        solid={solid}
        waiting={ghost}
        reduced={reduced}
        shift={settled ? `${(geom.drop / geom.rect.h) * 100}%` : "0%"}
        className="flex min-w-0 flex-col gap-1.5 overflow-hidden px-3 py-2 backdrop-blur-sm max-md:flex-row max-md:items-center max-md:gap-2"
        style={{
          borderColor: tint("cyan", tone.border),
          backgroundColor: tint("cyan", tone.fill),
          boxShadow: quiet
            ? named && announced
              ? brandShadow("cyan", 18, 10)
              : undefined
            : brandShadow("cyan", 40, 22),
        }}
      >
        <Sheen on={arriving} reduced={reduced} />
        <Wash on={wash} depth={depth} reduced={reduced} />

        <span className="flex min-w-0 items-start gap-2 max-md:flex-1">
          {/* It is being worked from right now. The dot going out is the
              first half of the supersede beat, and it happens in place. */}
          <motion.span
            className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            initial={false}
            animate={{
              opacity: quiet ? 0 : reduced ? 1 : together ? [0.9, 0.45, 0.9] : [1, 0.35, 1],
            }}
            transition={
              quiet || reduced
                ? { duration: 0.5 }
                : together
                  ? BREATH
                  : { duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: geom.i * 0.19 }
            }
            aria-hidden="true"
          />
          <Part
            show={said}
            reduced={reduced}
            className={`min-w-0 text-base leading-snug transition-colors duration-500 max-md:truncate md:line-clamp-2 ${
              quiet ? "text-muted-dark" : "text-foreground"
            }`}
          >
            <span className="hidden md:inline">{known.line}</span>
            <span className="md:hidden">{known.short}</span>
          </Part>
        </span>

        <span className="flex shrink-0 items-center gap-1.5 overflow-hidden md:mt-auto">
          {stillHere && geom.drop > 0 && (
            <Chip reduced={reduced} strong>
              {COPY.chips.stillHere}
            </Chip>
          )}
          {named && announced && (
            <span className={leftAlone ? "hidden md:contents" : "contents"}>
              <Chip reduced={reduced} strong>
                <span className="hidden md:inline">{COPY.chips.firstQuiet}</span>
                <span className="md:hidden">{COPY.chips.firstQuietShort}</span>
              </Chip>
            </span>
          )}
          {named && leftAlone && <Chip reduced={reduced}>{COPY.chips.untouched}</Chip>}
        </span>
      </Slot>
    </>
  );
}
