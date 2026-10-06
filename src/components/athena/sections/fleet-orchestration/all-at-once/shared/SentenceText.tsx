"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { stepDelay } from "@/components/athena/stage/stages";
import { ANSWER_PHRASE, HUES, type Clause } from "./cast";

/**
 * The request's words, typed a clause at a time, each phrase that becomes work
 * lit in its teammate's colour once that teammate exists - so the sentence
 * doubles as the legend. The last phrase, the one that becomes the answer,
 * lights last, in the page's own ink with a cyan underscore.
 *
 * Highlights bleed outside their run (`-mx-1` + `px-1`) and carry their
 * padding unlit, so lighting a phrase can never re-wrap the sentence.
 */

function Phrase({ seg, lit, reduced, base }: { seg: Clause[number]; lit: boolean[]; reduced: boolean; base: number }) {
  const hue = seg.task !== undefined && seg.task < HUES.length ? HUES[seg.task] : null;
  const on = seg.task !== undefined && lit[seg.task];
  const answer = seg.task === ANSWER_PHRASE;
  const words = seg.t.split(/(\s+)/);
  let n = base;
  return (
    <span
      className={seg.task === undefined ? undefined : "box-decoration-clone -mx-1 rounded-md px-1 transition-[background-color,color,box-shadow] duration-500"}
      style={
        on
          ? hue
            ? { backgroundColor: tint(hue, 16), color: BRAND_VAR[hue], boxShadow: brandShadow(hue, 14, 20) }
            : { backgroundColor: "rgba(var(--surface-overlay), 0.1)", boxShadow: `inset 0 -2px 0 ${BRAND_VAR.cyan}` }
          : undefined
      }
    >
      {words.map((w, i) =>
        w.trim() === "" ? (
          w
        ) : (
          <motion.span
            key={i}
            className={`inline-block ${answer && on ? "font-semibold" : ""}`}
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.3, delay: stepDelay(n++, 0.04) }}
          >
            {w}
          </motion.span>
        ),
      )}
    </span>
  );
}

export default function SentenceText({
  request,
  clauses,
  lit,
  reduced,
}: {
  request: readonly Clause[];
  clauses: number;
  lit: boolean[];
  reduced: boolean;
}) {
  return (
    <>
      {request.slice(0, clauses).map((clause, ci) => (
        <span key={ci}>
          {clause.map((seg, si) => (
            <Phrase key={si} seg={seg} lit={lit} reduced={reduced} base={si * 3} />
          ))}
        </span>
      ))}
    </>
  );
}
