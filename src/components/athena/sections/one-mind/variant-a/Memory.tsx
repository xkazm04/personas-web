"use client";

import { useMemo, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, KNOWN, LEARNED } from "./copy";
import type { FieldLayout } from "./layout";
import { Part, rectStyle, Sheen, Slot } from "./parts";
import { spineWires } from "./threads";

/**
 * The one body of memory every conversation draws on.
 *
 * It is deliberately ONE thing rather than a shelf of records: a single wide
 * panel, a single line running the length of it, and everything she knows
 * strung along that line. Several conversations, several ways in, one body —
 * which is the section's whole claim, stated as geometry before a single word
 * is read.
 *
 * The place the new fact will land is held open from the first frame as an
 * empty dashed bead that solidifies where it stands. Nothing shuffles aside
 * when the fact arrives and the shape of the memory never changes: there was
 * always room, which is a quieter way of saying she never has to forget one
 * thing to learn another.
 */

/** One remembered thing. Quiet until she has a reason to reach for it. */
function Bead({
  text,
  solid,
  lit,
  hot,
  reduced,
  className,
  style,
}: {
  text: string;
  solid: boolean;
  lit: boolean;
  hot: boolean;
  reduced: boolean;
  className: string;
  style: CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      {hot && !reduced && (
        <motion.span
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: tint("cyan", 16) }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
      )}
      <Part show={solid} reduced={reduced} className="flex min-w-0 items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: BRAND_VAR.cyan,
            boxShadow: lit || hot ? brandShadow("cyan", 8, 80) : undefined,
          }}
          aria-hidden="true"
        />
        <span className="min-w-0 truncate text-base text-foreground">{text}</span>
      </Part>
    </div>
  );
}

export default function Memory({
  layout,
  stage,
  landed,
  reach,
  unified,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  /** The new fact has come to rest here. */
  landed: boolean;
  /** She is reaching for it, to answer somewhere it was never said. */
  reach: boolean;
  unified: boolean;
  reduced: boolean;
}) {
  const shell = atStage(stage, "shell");
  const strung = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const wires = useMemo(() => spineWires(layout), [layout]);
  // Where the wiring runs decides where the words can go. A wide field brings
  // every thread down through the TOP of the memory, so the label reads as a
  // caption under what it names; a narrow one runs its line down the side and
  // leaves the top clear.
  const sideStrung = layout.spine.h > layout.spine.w;
  // The compact field carries fewer remembered things and the wide one more;
  // the LAST bead is always the place the new one lands.
  const known = KNOWN.slice(0, layout.facts.length - 1);

  return (
    <>
      <Slot
        rect={layout.band}
        solid={shell}
        waiting
        reduced={reduced}
        round="rounded-3xl"
        className={`flex flex-col gap-1 overflow-hidden px-4 py-3 backdrop-blur-md sm:px-6 ${
          sideStrung ? "justify-start" : "justify-end"
        }`}
        style={{
          borderColor: tint("cyan", landed || unified ? 40 : 22),
          backgroundColor: tint("cyan", 5),
          boxShadow: brandShadow("cyan", 44, landed || unified ? 16 : 8),
        }}
      >
        <Sheen on={landed} reduced={reduced} />
        <Part show i={0} reduced={reduced} className={`truncate ${ANNOTATION}`}>
          {COPY.memory.label}
        </Part>
        <Part show={detail} i={1} reduced={reduced} className="truncate text-base text-muted-dark">
          {COPY.memory.shared}
        </Part>
      </Slot>

      {/* The line everything she knows is strung on, the stems that bring each
          conversation's thread down onto it, and the taps it hangs off */}
      {wires.map((bar, i) => {
        const up = bar.h > bar.w;
        return (
          <motion.span
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              ...rectStyle(bar),
              transformOrigin: up ? "top" : "left",
              backgroundColor: tint("cyan", unified ? 70 : 44),
            }}
            initial={reduced ? false : up ? { scaleY: 0 } : { scaleX: 0 }}
            animate={up ? { scaleY: strung ? 1 : 0 } : { scaleX: strung ? 1 : 0 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.55, delay: i * 0.05, ease: "easeOut" }
            }
            aria-hidden="true"
          />
        );
      })}

      {layout.facts.map((rect, i) => {
        const fresh = i === layout.facts.length - 1;
        const empty = fresh && !landed;
        return (
          <Bead
            key={fresh ? LEARNED : known[i]}
            text={fresh ? LEARNED : known[i]}
            solid={fresh ? landed : strung}
            lit={fresh && landed}
            hot={fresh && (reach || unified)}
            reduced={reduced}
            className={`absolute flex items-center overflow-hidden rounded-full border px-3 ${
              reduced ? "" : "duration-500 transition-[background-color,border-color,box-shadow]"
            }`}
            style={{
              ...rectStyle(rect),
              borderStyle: empty ? "dashed" : "solid",
              borderColor: tint("cyan", empty ? 16 : fresh ? 48 : 24),
              backgroundColor: tint("cyan", empty ? 3 : fresh ? 12 : 7),
              boxShadow: fresh && landed ? brandShadow("cyan", 24, 26) : undefined,
            }}
          />
        );
      })}
    </>
  );
}
