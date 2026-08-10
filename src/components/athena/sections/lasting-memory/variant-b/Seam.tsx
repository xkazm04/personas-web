"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { ANNOTATION, ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { COPY } from "./copy";
import type { FieldLayout, Point } from "./layout";
import Presence from "./Presence";

/**
 * The lit region, and the line at the bottom of it.
 *
 * The lens is light rather than a box on purpose: "in use" is a condition,
 * not a container, and drawing a frame around it would say that the things
 * below have been put OUT of something. They have not — they are on the same
 * field, in the same frame, one layer further from the light.
 *
 * The seam is where the light stops. She stands at the near end of it, so
 * the whole band reads as lit BY her: what she is working from is simply
 * what she currently has her attention on, and the layer below is the same
 * material with the attention taken off it.
 *
 * The two annotations are the only labels in the section, and the lower one
 * carries its whole argument in four words.
 */

function Note({
  at,
  show,
  className,
  children,
}: {
  at: Point;
  show: boolean;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`absolute max-w-[46%] -translate-y-1/2 truncate text-right transition-opacity duration-500 ${className}`}
      style={{ right: `${100 - at.x}%`, top: `${at.y}%`, opacity: show ? 1 : 0 }}
    >
      {children}
    </span>
  );
}

export default function Seam({
  layout,
  caption,
  present,
  working,
  announcing,
  together,
  useLabel,
  restLabel,
  reduced,
}: {
  layout: FieldLayout;
  caption: string | null;
  present: boolean;
  working: boolean;
  announcing: boolean;
  together: boolean;
  useLabel: boolean;
  restLabel: boolean;
  reduced: boolean;
}) {
  return (
    <>
      {/* The light itself — strongest where it stops */}
      <motion.span
        className="pointer-events-none absolute left-0 right-0 top-0"
        style={{
          height: `${layout.lens.h}%`,
          background: `linear-gradient(180deg, ${tint("cyan", 3)} 0%, ${tint("cyan", 14)} 100%)`,
        }}
        initial={false}
        animate={{ opacity: present ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.8 }}
        aria-hidden="true"
      />

      <Note at={layout.useLabel} show={useLabel} className={ANNOTATION}>
        {COPY.zones.inUse}
      </Note>
      <Note at={layout.keptLabel} show={restLabel} className={ANNOTATION_DIM}>
        <span className="hidden md:inline">{COPY.zones.kept}</span>
        <span className="md:hidden">{COPY.zones.keptShort}</span>
      </Note>

      <motion.div
        className="absolute left-0 right-0 z-20 flex -translate-y-1/2 items-center gap-2.5 sm:gap-3"
        style={{ top: `${layout.seam}%` }}
        initial={false}
        animate={{ opacity: present ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.6 }}
      >
        <Presence
          caption={caption}
          working={working}
          announcing={announcing}
          together={together}
          reduced={reduced}
        />
        <span
          className="h-px min-w-0 flex-1"
          style={{
            background: `linear-gradient(90deg, ${tint("cyan", 85)}, ${tint("cyan", 22)})`,
            boxShadow: `0 0 8px ${tint("cyan", 40)}`,
          }}
          aria-hidden="true"
        />
      </motion.div>
    </>
  );
}
