"use client";

// PROTOTYPE COPY — extract to src/i18n at assembly
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { PANEL, PANEL_ACTIVE, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY, type JourneyPanelDef, type PanelState } from "./threadData";

/*
 * One miniature product screen along the thread. States:
 *   upcoming — dim but readable, waiting for the thread,
 *   active   — SPRING_POP lift, four corner brackets lock onto the exact
 *              control, a ≤5-word caption marks the step,
 *   visited  — stays lit with a small checked tick.
 * Under reduced motion the visited panels also keep their captions, so
 * the pinned frame narrates every step taken so far.
 */

const BRACKETS = [
  "left-0 top-0 border-l-2 border-t-2",
  "right-0 top-0 border-r-2 border-t-2",
  "left-0 bottom-0 border-l-2 border-b-2",
  "right-0 bottom-0 border-r-2 border-b-2",
] as const;

export default function JourneyPanel({
  def,
  state,
  reduced,
}: {
  def: JourneyPanelDef;
  state: PanelState;
  reduced: boolean;
}) {
  const active = state === "active";
  const visited = state === "visited";
  const showCaption = active || (reduced && visited);
  const isRunControl = def.id === "monitor";
  const pos = {
    "--xm": `${def.mobile.x}%`,
    "--ym": `${def.mobile.y}%`,
    "--xd": `${def.desktop.x}%`,
    "--yd": `${def.desktop.y}%`,
  } as CSSProperties;

  return (
    <motion.div
      className="absolute z-10 w-[46%] max-w-[190px] -translate-x-1/2 -translate-y-1/2 md:w-[17%] md:max-w-[230px] left-[var(--xm)] top-[var(--ym)] md:left-[var(--xd)] md:top-[var(--yd)]"
      style={pos}
      initial={false}
      animate={{
        opacity: state === "upcoming" ? 0.62 : 1,
        scale: active ? 1.06 : 1,
        y: active ? -6 : 0,
      }}
      transition={reduced ? { duration: 0 } : SPRING_POP}
    >
      <div
        className={`${active ? PANEL_ACTIVE : PANEL} relative px-3 py-2.5`}
        style={active ? { boxShadow: brandShadow("cyan", 26, 22) } : undefined}
      >
        {/* Screen chrome — label row */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: visited ? BRAND_VAR.emerald : BRAND_VAR.cyan }}
              aria-hidden="true"
            />
            <span className="truncate font-mono text-xs uppercase tracking-widest text-foreground/85">
              {def.label}
            </span>
          </span>
          {visited && (
            <motion.span
              initial={reduced ? false : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING_POP}
              className="text-xs text-emerald-300"
            >
              {COPY.visitedTick}
            </motion.span>
          )}
        </div>

        {/* Sketch rows — the screen's content, one word each */}
        <div className="mt-2 space-y-1">
          {def.rows.map((row) => (
            <div
              key={row}
              className="flex items-center gap-1.5 rounded-md border border-glass px-1.5 py-0.5"
            >
              <span className="h-1 w-1 rounded-full bg-foreground/25" aria-hidden="true" />
              <span className="truncate text-xs text-foreground/70">{row}</span>
            </div>
          ))}
        </div>

        {/* The control the brackets lock onto */}
        <div className="relative mt-2">
          <motion.div
            className="rounded-lg border px-2 py-1 text-center font-mono text-xs"
            style={{
              borderColor: active || (isRunControl && visited) ? tint("cyan", 55) : undefined,
              color: active ? BRAND_VAR.cyan : undefined,
              backgroundColor: active ? tint("cyan", 10) : undefined,
            }}
            initial={false}
            animate={
              isRunControl && active && !reduced
                ? { scale: [1, 1.07, 1], boxShadow: [brandShadow("cyan", 8, 15), brandShadow("cyan", 22, 45), brandShadow("cyan", 8, 15)] }
                : { scale: 1 }
            }
            transition={isRunControl && active && !reduced ? { duration: 1.1, repeat: Infinity } : { duration: 0.3 }}
          >
            <span className={active ? "" : "text-foreground/70"}>{def.control}</span>
          </motion.div>

          {/* Four corner brackets — lock on arrival */}
          <AnimatePresence>
            {active && (
              <motion.div
                className="pointer-events-none absolute -inset-1.5"
                initial={reduced ? false : { opacity: 0, scale: 1.35 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={reduced ? { duration: 0 } : SPRING_POP}
                aria-hidden="true"
              >
                {BRACKETS.map((corner) => (
                  <span
                    key={corner}
                    className={`absolute h-2.5 w-2.5 ${corner}`}
                    style={{ borderColor: BRAND_VAR.cyan }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Step caption — ≤5 words, marks the step */}
      <AnimatePresence>
        {showCaption && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full border border-brand-cyan/30 bg-surface/90 px-2.5 py-0.5 font-mono text-xs text-cyan-100 backdrop-blur-sm"
          >
            {def.caption}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
