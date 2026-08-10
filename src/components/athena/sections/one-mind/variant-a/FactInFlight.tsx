"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import Anchor from "./Anchor";
import { LEARNED } from "./copy";
import { restPoint, type FieldLayout } from "./layout";

/**
 * The thing you just said, on its way to being kept.
 *
 * It is the same words in the same shape as the line you typed and the bead it
 * becomes — so a viewer can point at the fact and follow it the whole way,
 * which is the only reason this layer exists. It rides the screen layer on a
 * transform, at its authored size: knowledge does not get bigger or smaller as
 * it travels, and neither does the type carrying it.
 *
 * Timed to arrive exactly as its place on the memory solidifies underneath it,
 * so the handover reads as one object landing rather than two objects trading
 * places.
 */

const FLY = { duration: 0.9, ease: [0.4, 0, 0.2, 1] } as const;

export default function FactInFlight({ layout, reduced }: { layout: FieldLayout; reduced: boolean }) {
  if (reduced) return null;
  // It travels at the EXACT size and shape of the place it is going, so
  // arriving is not a transition — the thing simply comes to rest on the place
  // that was being held for it, and the place solidifies underneath it.
  const seat = layout.facts[layout.facts.length - 1];
  return (
    <Anchor at={restPoint(layout)} from={layout.lift} transition={FLY} className="z-40">
      {/* Centred with framer's own x/y rather than Tailwind's translate
          utilities: a motion element writes `transform` wholesale, so a
          `-translate-x-1/2` class beside an animated `scale` is silently
          dropped and the pill hangs off its own anchor point. */}
      <motion.span
        className="absolute left-0 top-0 flex items-center gap-2 overflow-hidden rounded-full border px-3 backdrop-blur-sm"
        style={{
          width: `${seat.w}%`,
          height: `${seat.h}%`,
          borderColor: tint("cyan", 55),
          backgroundColor: tint("cyan", 14),
          boxShadow: brandShadow("cyan", 30, 34),
        }}
        initial={{ scale: 0.9, opacity: 0, x: "-50%", y: "-50%" }}
        animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 8, 80) }}
        />
        <span className="min-w-0 truncate text-base text-foreground">{LEARNED}</span>
      </motion.span>
    </Anchor>
  );
}
