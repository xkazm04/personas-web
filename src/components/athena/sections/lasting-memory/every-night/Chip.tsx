"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { chipRect, dropFrom, type FieldLayout } from "./layout";
import { Wash } from "./ink";
import { SKIN, fs, rectStyle } from "./parts";

/**
 * One durable thing she keeps - on wide screens a CARD that carries the
 * sentence she wrote about it, on phones a small chip whose sentence is
 * stacked below the shelf.
 *
 * It ARRIVES BY FALLING out of the talk it was distilled from, a pure
 * transform down its own column, and lands standing on the ledge with a
 * shadow under it. Once down it never dims, never moves and never leaves. The
 * one thing that changes is that it can go WARM, days later, when it turns out
 * to be the thing she needs again.
 */

/** Settled, in use again, and the calm lift of the closing hold. Colour rides
 *  a scoped CSS transition: framer cannot interpolate `color-mix()`. */
const CALM = { ring: 34, fill: 9, glow: 10 };
const HOT = { ring: 90, fill: 24, glow: 30 };
const HELD = { ring: 48, fill: 13, glow: 16 };

/** Her night, as a glyph: the card remembers which kind of moment made it. */
const MOON = "M 0 -10 A 10 10 0 0 0 0 10 A 5.5 10 0 0 1 0 -10 Z";

export default function Chip({
  layout,
  day,
  k,
  text,
  shown,
  falling,
  hot,
  warm,
  settle,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  day: number;
  k: number;
  /** The sentence, when the layout writes it on the card. */
  text: string | null;
  shown: boolean;
  falling: boolean;
  hot: boolean;
  /** Has come back into use at least once; its words stay lit. */
  warm: boolean;
  settle: boolean;
  holding: boolean;
  reduced: boolean;
}) {
  const skin = hot ? HOT : holding ? HELD : CALM;
  const drop = dropFrom(layout);

  return (
    <motion.div
      className="absolute"
      style={rectStyle(chipRect(layout, day, k))}
      initial={reduced ? false : { opacity: 0, y: drop }}
      animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : drop }}
      transition={
        reduced || !shown ? { duration: 0 } : { ...SPRING_POP, delay: falling ? k * 0.16 : 0 }
      }
      aria-hidden="true"
    >
      {/* Its shadow on the ledge. */}
      {text !== null && (
        <span
          className={`pointer-events-none absolute inset-x-[8%] -bottom-[7%] h-[12%] rounded-full blur-md ${SKIN}`}
          style={{ backgroundColor: tint("cyan", hot ? 42 : 20) }}
        />
      )}
      <span
        className={`absolute inset-0 rounded-xl border ${SKIN}`}
        style={{
          borderColor: tint("cyan", skin.ring),
          backgroundColor: tint("cyan", skin.fill),
          boxShadow: `inset 0 1px 0 ${tint("cyan", 40)}, ${brandShadow("cyan", skin.glow, hot ? 55 : 30)}`,
        }}
      />
      {/* Phones: no words on the thing itself (they are stacked below the
          shelf), so it wears its night's moon - a kept thing, not a socket. */}
      {text === null && (
        <svg viewBox="-12 -12 24 24" className="absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          <path d={MOON} transform="rotate(-28)" fill={tint("cyan", warm ? 95 : 70)} className="transition-[fill] duration-500" />
        </svg>
      )}
      {text !== null && (
        <span className="absolute inset-0 flex flex-col justify-end px-[8%] py-[7%]">
          <svg
            viewBox="-12 -12 24 24"
            className="absolute right-[7%] top-[9%] h-[1em] w-[1em]"
            style={fs(16, 12)}
            aria-hidden="true"
          >
            <path d={MOON} transform="rotate(-28)" fill={tint("cyan", warm ? 95 : 55)} />
          </svg>
          <span
            className={`font-medium leading-snug duration-500 transition-colors ${warm ? "" : "text-foreground"}`}
            style={{ ...fs(17.5, 15), color: warm ? BRAND_VAR.cyan : undefined }}
          >
            {text}
          </span>
        </span>
      )}
      <Wash on={settle} reduced={reduced} />
    </motion.div>
  );
}
