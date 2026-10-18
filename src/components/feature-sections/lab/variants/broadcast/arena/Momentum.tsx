"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { CAPS } from "../Frame";
import { beat } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { MARGINS, MAX_MARGIN, ROUNDS } from "./match";
import { SIDE_TONE } from "./Scorebug";

/**
 * The momentum strip: one column per round, a bar above the line when side A
 * took it and below when B did, its height the winning margin. Once the match
 * is final each column is a button that re-cues that round.
 */
export default function Momentum({ shown, current, done, onPick, moving }: { shown: number; current: number | null; done: boolean; onPick: (round: number) => void; moving: boolean }) {
  const c = broadcastCopy.arena;
  return (
    <div className="flex h-full flex-col border-t border-glass px-3 py-2 md:border-l md:border-t-0">
      <div className={`${CAPS} mb-1 text-sm text-foreground/70`}>{c.momentum}</div>
      <ol className="grid h-28 grid-cols-5 gap-1 md:h-auto md:min-h-0 md:flex-1">
        {ROUNDS.map((r, i) => {
          const m = MARGINS[i];
          const tone = SIDE_TONE[r.winner];
          const on = i < shown;
          const h = Math.abs(m) / MAX_MARGIN;
          return (
            <li key={r.id} className="min-w-0">
              <button
                type="button"
                disabled={!done}
                aria-pressed={current === i}
                aria-label={fillTemplate(c.reviewAria, { n: r.id })}
                onClick={() => onPick(i)}
                className="relative flex h-full w-full flex-col rounded-md border px-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 enabled:hover:border-glass-hover"
                style={{ borderColor: current === i ? tint(tone, 60) : "transparent", background: current === i ? tint(tone, 8) : "transparent" }}
              >
                <span className="relative flex flex-1 items-end justify-center">
                  {m > 0 && (
                    <motion.span
                      className="block h-full w-3/5 origin-bottom -skew-x-12 rounded-t-sm"
                      style={{ background: BRAND_VAR[SIDE_TONE.A] }}
                      initial={false}
                      animate={{ scaleY: on ? h : 0 }}
                      transition={beat(moving, 0.6, 0.2)}
                    />
                  )}
                </span>
                <span aria-hidden className="h-px w-full bg-foreground/30" />
                <span className="relative flex flex-1 items-start justify-center">
                  {m < 0 && (
                    <motion.span
                      className="block h-full w-3/5 origin-top -skew-x-12 rounded-b-sm"
                      style={{ background: BRAND_VAR[SIDE_TONE.B] }}
                      initial={false}
                      animate={{ scaleY: on ? h : 0 }}
                      transition={beat(moving, 0.6, 0.2)}
                    />
                  )}
                </span>
                <span className="flex flex-col items-center font-mono text-sm leading-5 tabular-nums">
                  <span className="text-foreground/70">{fillTemplate(c.roundShort, { n: r.id })}</span>
                  <span style={{ color: on ? BRAND_VAR[tone] : "transparent" }}>{on ? (m > 0 ? `+${m}` : m) : ""}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
