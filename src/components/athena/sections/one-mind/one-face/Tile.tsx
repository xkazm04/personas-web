"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { MediumIcon } from "./shared/icons";
import { BREATH, Chorus, rectStyle } from "./shared/parts";
import type { Rect } from "./shared/types";
import { LABEL } from "./shared/type";
import type { TileContent } from "./copy";
import { faceMask, jitter, portraitLayer, type WallLayout } from "./layout";

/**
 * One window on the wall - one conversation.
 *
 * Mounted for the whole loop. Before it arrives it is a dashed outline;
 * then it is glass with its name, how you had it, and two bars of what was
 * said. Until the wall falls into register it sits slightly out of true (an
 * authored offset, tilt and scale - transform only), and the piece of her
 * face it carries is hidden. On register every window settles true at once,
 * the pieces line up, and the face develops through all of them while their
 * own chatter steps back so she reads first.
 *
 * `forward` is the window currently opened in front of the wall: it keeps
 * its place and wears a bright ring, so the eye can see where the open card
 * came from and where it will go back to.
 */

export default function Tile({
  index,
  rect,
  content,
  name,
  portrait,
  arrived,
  registered,
  forward,
  chorus,
  together,
  reduced,
  running,
}: {
  index: number;
  rect: Rect;
  content: TileContent;
  name: string | null;
  portrait: WallLayout["portrait"];
  arrived: boolean;
  registered: boolean;
  forward: boolean;
  chorus: boolean;
  together: boolean;
  reduced: boolean;
  running: boolean;
}) {
  const breathing = together && running;
  return (
    <motion.div
      className="absolute"
      style={rectStyle(rect)}
      initial={false}
      animate={registered ? { x: "0%", y: "0%", rotate: 0, scale: 1 } : jitter(index)}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 16, delay: (index % 7) * 0.04 }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-lg border border-dashed transition-opacity duration-500"
        style={{ borderColor: tint("cyan", 18), opacity: arrived ? 0 : 1 }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-lg border"
        style={{
          ...LABEL,
          borderColor: tint("cyan", forward ? 70 : 20),
          backgroundColor: tint("cyan", 3),
          boxShadow: forward ? brandShadow("cyan", 22, 40) : undefined,
        }}
        initial={false}
        animate={{ opacity: !arrived ? 0 : breathing ? [1, 0.82, 1] : 1 }}
        transition={breathing ? BREATH : { duration: reduced ? 0 : 0.5 }}
      >
        {/* Her face: a wall-sized layer, offset to this window's piece. The
            portrait is its own luminance mask, so its black ground drops out
            and only the light of her stays - on any theme's stage. */}
        <motion.div
          className="pointer-events-none absolute bg-no-repeat dark:brightness-[1.9] dark:saturate-[1.25]"
          style={{
            ...portraitLayer(rect),
            backgroundImage: "url(/athena/athena_baseline.jpg)",
            backgroundSize: portrait.size,
            backgroundPosition: portrait.pos,
            ...faceMask(portrait),
          }}
          initial={false}
          animate={{ opacity: registered ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 1.6, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <Chorus on={chorus} reduced={reduced} />

        <motion.span
          className="relative flex h-full flex-col gap-[0.4em] px-[0.7em] py-[0.55em]"
          initial={false}
          animate={{ opacity: registered ? 0.62 : 1 }}
          transition={{ duration: reduced ? 0 : 1.2 }}
        >
          <span className="flex items-center gap-[0.45em] whitespace-nowrap text-foreground">
            <span className="text-brand-cyan">
              <MediumIcon medium={content.medium} />
            </span>
            {name && <span>{name}</span>}
          </span>
          {content.bars.map((w, b) => (
            <span
              key={b}
              className={`h-[0.7em] rounded-full ${b === 1 ? "ml-auto" : ""}`}
              style={{ width: `${w}%`, backgroundColor: tint("cyan", b === 1 ? 16 : 11) }}
            />
          ))}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
