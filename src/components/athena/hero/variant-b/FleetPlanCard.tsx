"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { EDITED_ROW_INDEX, FLEET_ROWS, HERO_COPY, type Effort } from "./data";

/**
 * FleetPlanCard — phases 2–3 of the Conductor sequence. The waveform
 * resolves into an editable plan: 3 rows (project / objective / model /
 * effort / agent count), one row visibly edited, then Confirm pulses.
 * Nothing below this card ignites until Confirm — that IS the product claim.
 */

interface Props {
  visible: boolean;
  /** The edit phase has happened (row 2's effort chip is bumped). */
  edited: boolean;
  /** Confirm is pulsing, waiting for the click. */
  confirming: boolean;
  /** Confirm has fired — sessions claimed. */
  dispatched: boolean;
}

const CHIP =
  "inline-flex items-center rounded-full border border-glass px-2 py-0.5 font-mono text-xs";

function effortStyle(effort: Effort) {
  return effort === "high"
    ? { borderColor: tint("amber", 45), color: BRAND_VAR.amber }
    : { color: "var(--muted)" };
}

export default function FleetPlanCard({ visible, edited, confirming, dispatched }: Props) {
  const reduced = useReducedMotion() ?? false;
  const snap = reduced ? { duration: 0 } : undefined;

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-glass-hover bg-background/70 backdrop-blur-xl"
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0.2, y: 10 }}
      transition={snap ?? { duration: 0.5, ease: "easeOut" }}
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
            key={row.project}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-glass px-4 py-2.5"
            initial={false}
            animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            transition={snap ?? { duration: 0.4, delay: i * 0.14, ease: "easeOut" }}
            style={isEdited ? { backgroundColor: tint(row.accent, 6) } : undefined}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR[row.accent] }}
              aria-hidden="true"
            />
            <span className="font-mono text-sm text-foreground">{row.project}</span>
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
        <motion.span
          role="presentation"
          className="rounded-xl border px-4 py-2 font-mono text-sm text-foreground"
          style={{
            borderColor: tint("cyan", dispatched ? 70 : 40),
            backgroundColor: tint("cyan", dispatched ? 18 : 8),
          }}
          animate={
            confirming && !reduced
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
          transition={confirming && !reduced ? { duration: 0.9, repeat: Infinity } : snap}
        >
          {dispatched ? HERO_COPY.dispatchedLabel : HERO_COPY.confirmLabel}
        </motion.span>
      </div>
    </motion.div>
  );
}
