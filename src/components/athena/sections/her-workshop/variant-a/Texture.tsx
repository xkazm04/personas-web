"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { COPY, inkAt, paceAt } from "./copy";
import type { InkMode, Look } from "./look";

/**
 * What is actually on a screen — the evidence every verdict in this section is
 * made of, and the reason the section can claim what it claims.
 *
 * Five textures, and each one is a different piece of the argument:
 *
 *   running   finished lines, and one more still being written. This is the
 *             only test that matters: something is coming out of it, so it is
 *             working, and nothing else about it can make it stuck.
 *   frozen    the same lines, and the line it stopped in the middle of. Nothing
 *             is moving. That is an observation — on its own it does not say
 *             whether this is finished, waiting, or in trouble.
 *   quiet     lines, no half-written one. It ran out of things to say.
 *   prompt    a question, sitting on the screen, with the cursor still blinking
 *             after it. This is the case no record of the run would ever show,
 *             which is exactly why what is on the screen is what she goes by.
 *   thin      almost nothing. Not enough to draw any conclusion from — and the
 *             screen wearing this texture is the one she refuses to call.
 *
 * One live element per screen at most. The written line grows from its left
 * edge and snaps back, which is what a terminal wrapping a line looks like, and
 * it is a transform — so twenty of them cost the compositor and not the main
 * thread. Under reduced motion the same line is drawn once, part-written, and
 * left alone.
 */
export default function Texture({
  job,
  lines,
  mode,
  look,
  showCaret,
  reduced,
}: {
  job: number;
  lines: number;
  mode: InkMode;
  look: Look;
  showCaret: boolean;
  reduced: boolean;
}) {
  if (mode === "prompt") {
    return (
      <span className="flex min-h-0 flex-1 items-end gap-1.5">
        <span className="min-w-0 truncate font-mono text-base text-foreground">{COPY.prompt}</span>
        {showCaret && (
          <motion.span
            className="mb-0.5 h-4 w-2 shrink-0 rounded-[1px]"
            style={{ backgroundColor: BRAND_VAR.amber }}
            animate={reduced ? undefined : { opacity: [1, 0.1, 1] }}
            transition={reduced ? undefined : { duration: 1.1, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />
        )}
      </span>
    );
  }

  const shown = mode === "thin" ? 1 : lines;
  const write = tint(look.accent, look.ink + 22);

  return (
    <span className="flex min-h-0 flex-1 flex-col justify-end gap-1" aria-hidden="true">
      {Array.from({ length: shown }, (_, k) => (
        <span
          key={k}
          className="block h-1 rounded-full"
          style={{
            width: `${Math.round(inkAt(job, k) * 100)}%`,
            backgroundColor: tint(look.accent, look.ink),
          }}
        />
      ))}

      {/* The line still being written — the whole basis for "it is working" */}
      {mode === "running" &&
        (reduced ? (
          <span
            className="block h-1 rounded-full"
            style={{ width: "58%", backgroundColor: write }}
          />
        ) : (
          <motion.span
            className="block h-1 origin-left rounded-full"
            style={{ width: "84%", backgroundColor: write }}
            animate={{ scaleX: [0.04, 1] }}
            transition={{ duration: paceAt(job), repeat: Infinity, ease: "linear" }}
          />
        ))}

      {/* The line it stopped in the middle of. It does not move, and it does
          not pretend to have finished either. */}
      {mode === "frozen" && (
        <span
          className="block h-1 rounded-full"
          style={{ width: "44%", backgroundColor: tint(look.accent, look.ink) }}
        />
      )}
    </span>
  );
}
