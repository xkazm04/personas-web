"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import Brace from "./Brace";
import { COPY } from "./copy";
import { markX, type FieldLayout } from "./layout";
import { Rule } from "./ink";
import { Part } from "./parts";

/**
 * Where she stopped — and what that costs nobody.
 *
 * A marker's stem runs from above the seam all the way DOWN to the bracket
 * line, cutting through the messages it divides rather than sitting beside
 * them, so it reads as a fact about the seam instead of an annotation on it.
 * The dashed run carries that same line further down to the account that
 * explains it, so the division above the seam and the division below it are
 * one continuous thing. On a narrow field the runs are dropped (three long
 * verticals across 390px read as a grid) and the accounts' stacking order says
 * the same in less ink.
 *
 * The mark draws on a delay, after her 900ms glide has landed: she arrives,
 * and THEN it plants. A flag that appeared while she was still moving would be
 * a flip rather than a stop.
 */

const INK = tint("cyan", 70);
const BRACE_INK = tint("cyan", 55);
/** Long enough for her glide to finish first. */
const PLANT = 0.5;

function Flag({ shown, reduced }: { shown: boolean; reduced: boolean }) {
  return (
    <motion.span
      className="block origin-bottom-left"
      initial={reduced ? false : { opacity: 0, scaleX: 0.2 }}
      animate={{ opacity: shown ? 1 : 0, scaleX: shown ? 1 : 0.2 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.45, ease: "easeOut", delay: shown ? PLANT + 0.3 : 0 }
      }
      style={{ filter: `drop-shadow(${brandShadow("cyan", 6, 60)})` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 12 14" className="h-5 w-4" fill="none" aria-hidden="true">
        <path d="M1.2 14 V1" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M2 1.5 H11 L8.1 4.3 L11 7.1 H2 Z"
          fill={tint("cyan", 42)}
          stroke={INK}
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </motion.span>
  );
}

function Marker({
  layout,
  pass,
  stood,
  joined,
  reduced,
}: {
  layout: FieldLayout;
  pass: number;
  stood: boolean;
  joined: boolean;
  reduced: boolean;
}) {
  const x = markX(layout, pass);
  return (
    <>
      <div
        className="absolute -translate-x-[2px] -translate-y-full"
        style={{ left: `${x}%`, top: `${layout.markTop}%` }}
      >
        <Flag shown={stood} reduced={reduced} />
      </div>

      <Rule
        origin="top"
        drawn={stood}
        reduced={reduced}
        delay={PLANT}
        centerX
        color={INK}
        left={`${x}%`}
        top={`${layout.markTop}%`}
        width="1px"
        height={`${layout.braceY - layout.markTop}%`}
      />

      {layout.joins && (
        <motion.span
          className="pointer-events-none absolute border-l border-dashed"
          style={{
            left: `${x}%`,
            top: `${layout.braceY}%`,
            height: `${layout.notes[0].y - layout.braceY}%`,
            borderColor: tint("cyan", 30),
          }}
          initial={false}
          animate={{ opacity: joined ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default function Marks({
  layout,
  marks,
  braces,
  joins,
  named,
  reduced,
}: {
  layout: FieldLayout;
  marks: number;
  braces: number;
  joins: boolean[];
  named: boolean;
  reduced: boolean;
}) {
  return (
    <>
      {[0, 1].map((pass) => (
        <Brace
          key={`b${pass}`}
          layout={layout}
          pass={pass}
          closed={braces > pass}
          color={BRACE_INK}
          reduced={reduced}
        />
      ))}

      {[0, 1].map((pass) => (
        <Marker
          key={`m${pass}`}
          layout={layout}
          pass={pass}
          stood={marks > pass}
          joined={joins[pass]}
          reduced={reduced}
        />
      ))}

      {/* No bracket of its own — that absence IS the claim. It is named, and it
          keeps its colour, because it is waiting rather than missed. */}
      <Part
        show={named}
        reduced={reduced}
        className={`absolute block text-right ${ANNOTATION_DIM}`}
        style={{
          right: `${100 - (layout.seam.x + layout.seam.w)}%`,
          top: `${layout.waitY}%`,
        }}
      >
        <span className="hidden sm:inline">{COPY.waiting}</span>
        <span className="sm:hidden">{COPY.waitingShort}</span>
      </Part>
    </>
  );
}
