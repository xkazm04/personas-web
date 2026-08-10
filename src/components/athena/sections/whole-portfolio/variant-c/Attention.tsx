"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import type { FieldLayout, Point } from "./layout";
import { Drift } from "./parts";

/**
 * The two kinds of attention on this field, which is the whole section in one
 * idea: yours, which moves — and hers, which does not.
 *
 * `Gaze` is yours. It is the key light: a warm pool that rests on whatever you
 * are working on and takes its warmth with it when it goes. Nothing in this
 * scene decays on a timer; things decay because this left them. That is why
 * the pool is the only element with real inertia — it drifts on a soft spring,
 * arrives late, and never snaps.
 *
 * `Wash` is hers. It is faint enough that you can look straight past it, and it
 * covers everything, always, from the moment the field exists — no sweep, no
 * scan line, no pass. It lifts once, when she has something to tell you.
 *
 * Both are pure ambience: `aria-hidden`, no layout, no text.
 */

/** Your attention, resting somewhere. */
export function Gaze({
  at,
  spread,
  reduced,
}: {
  at: Point;
  spread: number;
  reduced: boolean;
}) {
  return (
    <Drift dx={at.x} dy={at.y} reduced={reduced}>
      <motion.span
        className="absolute left-0 top-0 block -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: `${spread}%`,
          aspectRatio: "1",
          background: `radial-gradient(circle, ${tint("cyan", 24)}, ${tint("cyan", 8)} 42%, transparent 70%)`,
        }}
        animate={reduced ? undefined : { opacity: [0.86, 1, 0.86] }}
        transition={reduced ? undefined : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
    </Drift>
  );
}

/** Her attention: everywhere, all the time, and almost invisible until it
 *  matters. Two stacked washes crossfade, because a CSS gradient cannot tween
 *  its own stops. */
export function Wash({
  layout,
  alert,
  reduced,
}: {
  layout: FieldLayout;
  alert: boolean;
  reduced: boolean;
}) {
  const { x, y } = layout.watcher;
  const at = `at ${x}% ${y}%`;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span
        className="absolute inset-0 block"
        style={{
          background: `radial-gradient(ellipse 120% 96% ${at}, ${tint("cyan", 7)}, transparent 68%)`,
        }}
      />
      <motion.span
        className="absolute inset-0 block"
        style={{
          background: `radial-gradient(ellipse 130% 104% ${at}, ${tint("cyan", 15)}, transparent 72%)`,
        }}
        initial={false}
        animate={{ opacity: alert ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.9, ease: "easeOut" }}
      />
    </div>
  );
}
