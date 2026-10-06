"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import TravelLayer from "../shared/TravelLayer";
import { ToolGlyph } from "../shared/ToolGlyph";
import type { CursorState } from "./script";

/**
 * A multiplayer cursor: the pointer, a name tag riding under it, a ring that
 * pulses out where it clicks, and — for her — the tool tile she is dragging.
 * Two of these share the board, and which one moves tells you who does what:
 * yours picks, hers wires. Positions glide on a spring (transform only).
 */

const SPRING = { type: "spring", stiffness: 70, damping: 15, mass: 0.8 } as const;

export function Cursor({
  who,
  state,
  tick,
  name,
  line,
  reduced,
}: {
  who: "you" | "her";
  state: CursorState;
  /** Keys the click ring so it replays on every click beat. */
  tick: number;
  name: string;
  line: string | null;
  reduced: boolean;
}) {
  const her = who === "her";
  const ink = her ? BRAND_VAR.cyan : "var(--foreground)";
  return (
    <TravelLayer x={state.at.x} y={state.at.y} spring={reduced ? { duration: 0 } : SPRING} className={her ? "z-30" : "z-20"}>
      <span className="absolute left-0 top-0">
        {state.act === "click" && !reduced && (
          <motion.span
            key={tick}
            className="absolute -left-4 -top-4 h-8 w-8 rounded-full border-2"
            style={{ borderColor: ink }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.4], opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
          />
        )}
        {state.carry && (
          <motion.span
            className="absolute left-3 top-4 flex h-10 w-10 items-center justify-center rounded-xl border"
            style={{ borderColor: tint("cyan", 60), backgroundColor: "var(--surface)", boxShadow: brandShadow("cyan", 18, 40) }}
            initial={reduced ? false : { scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: -6 }}
            transition={reduced ? { duration: 0 } : SPRING_POP}
          >
            <ToolGlyph tool={state.carry} className="h-5 w-5" />
          </motion.span>
        )}
        <svg viewBox="0 0 24 24" className="relative h-7 w-7 -translate-x-[3px] -translate-y-[2px]" aria-hidden="true" style={{ filter: `drop-shadow(0 2px 6px ${tint(her ? "cyan" : "blue", 35)})` }}>
          <path d="M4 2.5 20 11.2l-7 1.6-3.4 6.7L4 2.5Z" fill={ink} stroke="var(--background)" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        <span
          className="absolute left-5 top-6 flex items-center gap-1.5 whitespace-nowrap rounded-full py-0.5 pl-1 pr-2.5 text-base font-medium"
          style={{
            backgroundColor: ink,
            color: "var(--background)",
            boxShadow: her ? brandShadow("cyan", 16, 40) : undefined,
          }}
        >
          {her && (
            <span className="relative h-5 w-5 overflow-hidden rounded-full">
              <Image src="/athena/athena_baseline_640.webp" alt="" fill sizes="20px" className="object-cover" />
            </span>
          )}
          {!her && <span className="w-1" />}
          {name}
          <AnimatePresence mode="wait">
            {line && (
              <motion.span
                key={line}
                className="font-normal opacity-80"
                initial={reduced ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 0.85, x: 0 }}
                exit={{ opacity: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.25 }}
              >
                · {line}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </span>
    </TravelLayer>
  );
}
