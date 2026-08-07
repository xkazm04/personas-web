"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { HERO_COPY, TERMINALS } from "./data";

/**
 * TerminalGrid — phase 4 of the Conductor sequence. Eight terminal tiles
 * (the dispatched sessions, capped at 8) ignite one by one after Confirm,
 * each with its own operator label and a "claimed n/8" footer — the visual
 * form of claim-before-spawn idempotent dispatch.
 */

interface Props {
  /** How many tiles are lit (0..TERMINALS.length). */
  litCount: number;
}

export default function TerminalGrid({ litCount }: Props) {
  const reduced = useReducedMotion() ?? false;
  const total = TERMINALS.length;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {TERMINALS.map((tile, i) => {
        const lit = i < litCount;
        return (
          <motion.div
            key={tile.operator}
            className="rounded-xl border border-glass bg-background/60 p-2.5 sm:p-3"
            initial={false}
            animate={{ opacity: lit ? 1 : 0.35, scale: lit ? 1 : 0.97 }}
            transition={reduced ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
            style={
              lit
                ? {
                    borderColor: tint(tile.accent, 35),
                    boxShadow: brandShadow(tile.accent, 18, 12),
                  }
                : undefined
            }
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: lit ? BRAND_VAR[tile.accent] : "var(--muted)" }}
                aria-hidden="true"
              />
              <span className="truncate font-mono text-[10px] uppercase tracking-wide text-foreground/60">
                {tile.operator}
              </span>
            </div>
            <p className="mt-1.5 truncate font-mono text-xs text-foreground/80">
              {lit ? tile.cmd : "···"}
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-dark">
              {lit
                ? `${HERO_COPY.claimedPrefix} ${i + 1}/${total}`
                : HERO_COPY.standbyLabel}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
