"use client";

import { motion } from "framer-motion";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { COPY } from "./copy";
import { center, type FieldLayout } from "./layout";
import { rectStyle, Swap } from "./parts";
import Presence from "./Presence";

/**
 * The middle zone — her, and the words that say what she is doing in it.
 *
 * She is the narrowest part of the picture and everything has to pass through
 * her, which is the anatomy's whole argument about proportion: much goes in at
 * the top, and what comes out the bottom is what fits through here.
 *
 * The word on her left is her STATE, and it is the only zone name on the field
 * that ever changes — because resting is a thing she does, not a gap between
 * things she does. Both words are mounted at once and crossfade, so the label
 * never moves.
 *
 * The caption under her is the beat: five words at most, one at a time, on its
 * own full-width row so it can never wrap down into the zone name below it.
 */
export default function Chamber({
  layout,
  shown,
  resting,
  distilling,
  pressure,
  caption,
  captionPrev,
  parity,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  shown: boolean;
  resting: boolean;
  distilling: boolean;
  pressure: number;
  caption: string | null;
  captionPrev: string | null;
  parity: number;
  holding: boolean;
  reduced: boolean;
}) {
  const mid = center(layout.chamber);
  const leftGutter = layout.chamber.x - 2;

  return (
    <>
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={rectStyle(layout.chamber)}
        aria-hidden="true"
      >
        <Presence
          shown={shown}
          resting={resting}
          distilling={distilling}
          pressure={pressure}
          holding={holding}
          reduced={reduced}
        />
      </div>

      <span
        className={`absolute grid text-right ${ANNOTATION_DIM}`}
        style={{
          right: `${100 - leftGutter}%`,
          top: `${mid.y}%`,
          width: `${leftGutter - 1}%`,
          transform: "translateY(-50%)",
        }}
      >
        {[COPY.zones.chamber.awake, COPY.zones.chamber.asleep].map((word, i) => (
          <motion.span
            key={word}
            style={{ gridArea: "1 / 1" }}
            initial={false}
            animate={{ opacity: shown && (i === 1) === resting ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.5 }}
          >
            {word}
          </motion.span>
        ))}
      </span>

      <Swap
        now={caption}
        prev={captionPrev}
        parity={parity}
        reduced={reduced}
        className={`absolute text-center ${ANNOTATION_DIM}`}
        style={{
          left: `${layout.kept.x}%`,
          top: `${layout.captionY}%`,
          width: `${layout.kept.w}%`,
        }}
      />
    </>
  );
}
