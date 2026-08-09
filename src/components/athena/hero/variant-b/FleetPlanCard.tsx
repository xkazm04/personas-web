"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ANNOTATION_DIM,
  PANEL,
  SPRING_POP,
} from "@/components/athena/stage/athena-tokens";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { EDITED_ROW_INDEX, FLEET_ROWS, HERO_COPY, type Effort } from "./data";

/**
 * FleetPlanCard — phases 2–3 of the Conductor sequence. The waveform
 * resolves into an editable plan: 3 rows (label / objective / model /
 * effort / agent count) dealt onto the stage as springs with a hint of
 * rotation (kp micro-physics). Rows elevate on hover (PANEL → PANEL_ACTIVE
 * delta) to signal editability. Confirm is a REAL focusable button — the
 * participatory beat: the visitor's click (not Athena's) ignites the
 * terminals, landing with a stamp punch + one-shot ring.
 */

interface Props {
  visible: boolean;
  /** The edit phase has happened (row 2's effort chip is bumped). */
  edited: boolean;
  /** Confirm is pulsing, waiting for the visitor's click. */
  confirming: boolean;
  /** Confirm has fired — sessions claimed. */
  dispatched: boolean;
  /** The visitor's click — routes into the cycle's confirm beat. */
  onConfirm: () => void;
}

const CHIP =
  "inline-flex items-center rounded-full border border-glass px-2 py-0.5 font-mono text-xs";

function effortStyle(effort: Effort) {
  return effort === "high"
    ? { borderColor: tint("amber", 45), color: BRAND_VAR.amber }
    : { color: "var(--muted)" };
}

export default function FleetPlanCard({
  visible,
  edited,
  confirming,
  dispatched,
  onConfirm,
}: Props) {
  const reduced = useReducedMotion() ?? false;
  const snap = reduced ? { duration: 0 } : undefined;
  const spring = (delay: number) => snap ?? { ...SPRING_POP, delay };

  return (
    <motion.div
      className={`${PANEL} overflow-hidden`}
      initial={false}
      animate={
        visible
          ? { opacity: 1, y: 0, rotate: 0, scale: 1 }
          : { opacity: 0.15, y: 26, rotate: -1.5, scale: 0.96 }
      }
      transition={spring(0)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-glass px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-widest text-foreground/70">
          {HERO_COPY.planTitle}
        </span>
        <span className="font-mono text-xs text-muted-dark">{HERO_COPY.planMeta}</span>
      </div>

      {FLEET_ROWS.map((row, i) => {
        const isEdited = edited && i === EDITED_ROW_INDEX;
        const effort = isEdited && row.editedEffort ? row.editedEffort : row.effort;
        return (
          <motion.div
            key={row.label}
            // hover = the PANEL → PANEL_ACTIVE elevation delta (editability cue)
            className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-glass px-4 py-2.5 transition-colors duration-200 hover:bg-surface/80"
            initial={false}
            animate={
              visible
                ? { opacity: 1, x: 0, rotate: 0 }
                : { opacity: 0, x: -18, rotate: i % 2 ? 2 : -2 }
            }
            transition={spring(0.1 + i * 0.12)}
            style={isEdited ? { backgroundColor: tint(row.accent, 6) } : undefined}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR[row.accent] }}
              aria-hidden="true"
            />
            <span className="font-mono text-sm text-foreground">{row.label}</span>
            <span className="hidden min-w-0 flex-1 truncate text-sm text-foreground/60 md:inline">
              {row.objective}
            </span>
            <span className={`${CHIP} text-foreground/70`}>{row.model}</span>
            <motion.span
              key={effort}
              className={CHIP}
              style={effortStyle(effort)}
              initial={reduced ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={snap}
            >
              {effort}
            </motion.span>
            {isEdited && (
              <motion.span
                className="font-mono text-[10px] uppercase tracking-wider text-brand-cyan"
                initial={reduced ? false : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={snap}
              >
                {HERO_COPY.editedTag}
              </motion.span>
            )}
            <span className="ml-auto shrink-0 font-mono text-xs text-muted-dark">
              {row.agents}&times; {HERO_COPY.agentsSuffix}
            </span>
          </motion.div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <span className="font-mono text-xs text-muted-dark">{HERO_COPY.planFooter}</span>
        <div className="flex items-center gap-3">
          {confirming && (
            <motion.span
              className={ANNOTATION_DIM}
              initial={reduced ? false : { opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={snap}
            >
              {HERO_COPY.confirmHint}
            </motion.span>
          )}
          <div className="relative">
            {/* One-shot stamp ring — remounts each cycle when dispatched flips */}
            {dispatched && !reduced && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl border-2"
                style={{ borderColor: tint("cyan", 60) }}
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 1.7 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            )}
            <motion.button
              type="button"
              onClick={onConfirm}
              className="rounded-xl border px-4 py-2 font-mono text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: tint("cyan", dispatched ? 70 : 40),
                backgroundColor: tint("cyan", dispatched ? 18 : 8),
                outlineColor: BRAND_VAR.cyan,
              }}
              animate={
                reduced
                  ? { scale: 1 }
                  : dispatched
                    ? { scale: [0.92, 1.04, 1] } // stamp punch on ignition
                    : confirming
                      ? {
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            brandShadow("cyan", 0, 0),
                            brandShadow("cyan", 28, 35),
                            brandShadow("cyan", 0, 0),
                          ],
                        }
                      : { scale: 1 }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : dispatched
                    ? { duration: 0.45, ease: "easeOut" }
                    : confirming
                      ? { duration: 0.9, repeat: Infinity }
                      : undefined
              }
            >
              {dispatched ? HERO_COPY.dispatchedLabel : HERO_COPY.confirmLabel}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
