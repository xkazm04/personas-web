"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { BREATH } from "../shared/parts";
import { LABEL } from "../shared/type";
import type { TokenPlace } from "./data";
import { tokenPoint, type DayLayout } from "./layout";

/**
 * Her line: the one continuous thing under the whole day.
 *
 * It draws as the day goes (a scale from its start, transform only), and at
 * every moment's stop sits the same face. The faces light when she speaks in
 * that moment; on the one-voice beat all three flash together, and from then
 * on they share one breath - three places, one person.
 *
 * What you said rides this line. A token lifts off your words, drops onto
 * the line at its stop, rides to the next stop with the day's light, and
 * rises into her first words there, where it dissolves into the phrase it
 * became. Each token is a full-size layer translated by percentages of the
 * field, so the journey is pure transform.
 */

const FACE = "clamp(2.4rem, min(10cqh, 5cqw), 5.25rem)";

export default function Line({
  layout,
  reach,
  spoke,
  tokens,
  labels,
  chorus,
  together,
  reduced,
  running,
}: {
  layout: DayLayout;
  /** How much of the line exists yet, 0..1. */
  reach: number;
  /** She has spoken at stop i. */
  spoke: readonly boolean[];
  tokens: readonly TokenPlace[];
  labels: readonly string[];
  chorus: boolean;
  together: boolean;
  reduced: boolean;
  running: boolean;
}) {
  const horizontal = layout.axis === "x";
  const s0 = layout.stops[0];
  const breathing = together && running;

  return (
    <>
      <motion.span
        className="pointer-events-none absolute rounded-full"
        style={{
          ...(horizontal
            ? { left: 0, right: 0, top: `${s0.y}%`, height: 2, originX: 0 }
            : { top: 0, bottom: 0, left: `${s0.x}%`, width: 2, originY: 0 }),
          translate: horizontal ? "0 -50%" : "-50% 0",
          backgroundImage: `linear-gradient(${horizontal ? "to right" : "to bottom"}, ${tint("cyan", 20)}, ${tint("cyan", 70)}, ${tint("cyan", 20)})`,
          boxShadow: brandShadow("cyan", 10, 30),
        }}
        initial={false}
        animate={horizontal ? { scaleX: reach } : { scaleY: reach }}
        transition={reduced ? { duration: 0 } : { duration: 1.7, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {layout.stops.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: FACE, height: FACE }}
          aria-hidden="true"
        >
          <motion.span
            className="absolute -inset-[35%] rounded-full blur-xl"
            style={{ backgroundColor: tint("cyan", 34) }}
            initial={false}
            animate={{ opacity: !spoke[i] ? 0 : breathing ? [0.9, 0.45, 0.9] : 0.7 }}
            transition={breathing ? BREATH : { duration: reduced ? 0 : 0.6 }}
          />
          {chorus && !reduced && (
            <motion.span
              className="absolute -inset-[60%] rounded-full border"
              style={{ borderColor: tint("cyan", 50) }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.4, opacity: [0, 0.9, 0] }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
          )}
          <span
            className="relative block h-full w-full overflow-hidden rounded-full border-2 transition-[filter,opacity] duration-500"
            style={{
              borderColor: tint("cyan", spoke[i] ? 70 : 25),
              backgroundColor: "var(--background)",
              filter: spoke[i] ? "none" : "grayscale(1)",
              opacity: spoke[i] ? 1 : 0.6,
            }}
          >
            <Image src="/athena/athena_baseline_640.webp" alt="" fill sizes="96px" className="object-cover" />
          </span>
        </span>
      ))}

      {tokens.map((place, k) => {
        const p = tokenPoint(layout, place);
        if (!p) return null;
        const gone = place.at === "recalled";
        return (
          <motion.div
            key={k}
            className="pointer-events-none absolute inset-0 z-30"
            initial={reduced ? false : { x: `${p.x}%`, y: `${p.y}%`, opacity: 0 }}
            animate={{ x: `${p.x}%`, y: `${p.y}%`, opacity: gone ? 0 : 1 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: place.at === "line" ? 1.7 : 0.7, ease: "easeInOut" }
            }
            aria-hidden="true"
          >
            <span
              className="absolute left-0 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[0.4em] whitespace-nowrap rounded-full border px-[0.75em] py-[0.2em] text-foreground"
              style={{
                ...LABEL,
                borderColor: tint("cyan", 55),
                backgroundColor: "color-mix(in srgb, var(--brand-cyan) 16%, var(--background))",
                boxShadow: brandShadow("cyan", 16, 35),
              }}
            >
              <span className="h-[0.45em] w-[0.45em] rounded-full" style={{ backgroundColor: BRAND_VAR.cyan }} />
              {labels[k]}
            </span>
          </motion.div>
        );
      })}
    </>
  );
}
