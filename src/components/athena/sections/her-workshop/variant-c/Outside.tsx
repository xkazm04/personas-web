"use client";

import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { tint } from "@/lib/brand-theme";
import { COPY } from "./copy";
import type { Rect } from "./layout";
import { Part, rectStyle } from "./parts";

/**
 * The one piece of work that is not in the yard.
 *
 * It is the only module in the scene with no stage plan, because it never
 * reaches one: it arrives as an outline and it is still an outline in the last
 * frame of the loop. Every other box on this field starts as exactly this and
 * then solidifies; this one is what all of them would look like if she could
 * not begin. Held one stage back, permanently, in the same material — which is
 * the argument made out of the scene rather than out of a caption.
 *
 * It sits above the line with clear space between it and the boundary, and it
 * never moves, dims, shakes or flashes. Nothing is refused on screen. The only
 * thing that ever happens to it is that it acquires the line "waits for you",
 * one beat after she stops — a piece of work with an owner, and the owner is
 * not her.
 */
export default function Outside({
  rect,
  shown,
  waits,
  reduced,
}: {
  rect: Rect;
  shown: boolean;
  waits: boolean;
  reduced: boolean;
}) {
  const c = COPY.outside;
  return (
    <div className="absolute" style={rectStyle(rect)}>
      <motion.div
        className="absolute inset-0 flex flex-col justify-center gap-1.5 overflow-hidden rounded-xl border border-dashed px-3 py-2"
        style={{ borderColor: tint("cyan", 20), backgroundColor: tint("cyan", 2) }}
        initial={false}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}
      >
        <Part
          show={shown}
          i={0}
          reduced={reduced}
          className="truncate text-base leading-snug text-muted-dark"
        >
          {c.name}
        </Part>
        <Part
          show={waits}
          reduced={reduced}
          className="flex items-center gap-2 text-base text-brand-cyan"
        >
          <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
          {c.waits}
        </Part>
      </motion.div>
    </div>
  );
}
