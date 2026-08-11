"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import Bench from "./Bench";
import { COPY, FIRED_ORDER, ORDERS } from "./copy";
import { FIRED_ANGLE, TICK_MS } from "./data";
import type { FieldLayout } from "./layout";
import { DrawCheck, Part } from "./parts";

/**
 * The bench that keeps its own time.
 *
 * Its form is the only round thing on the floor besides her: a DIAL, with the
 * rim crowded with standing orders and a pointer working its way round. The rim
 * is never counted and never labelled — a real desk carries far more of these
 * than anyone remembers, and a picture says that by being crowded, where a
 * number would only say it in the way a spec sheet does.
 *
 * The pointer is a pure function of the tick rather than a spin of its own, so
 * when an order comes round it is exactly on that mark at exactly that beat.
 * Nothing pressed it and nobody was needed; the mark simply arrives under the
 * hand, and the cable carries it to the desk.
 */

const SWEEP = { duration: TICK_MS / 1000, ease: "linear" } as const;

/**
 * Trig is not bit-identical between the engine that renders this on the server
 * and the one that hydrates it in the browser — the last digit of a `Math.sin`
 * drifts, and React reports a coordinate that differs at 1e-15 as a hydration
 * mismatch and throws the tree away. Rounding the rim to a thousandth of the
 * viewBox is far below anything visible and puts both engines on the same
 * number.
 */
const round = (n: number) => Math.round(n * 1000) / 1000;
const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const px = (deg: number, r: number) => round(50 + r * Math.cos(rad(deg)));
const py = (deg: number, r: number) => round(50 + r * Math.sin(rad(deg)));

function Dial({
  rim,
  sweep,
  firing,
  fired,
  reduced,
}: {
  rim: number;
  sweep: number;
  firing: boolean;
  fired: boolean;
  reduced: boolean;
}) {
  const marks = useMemo(
    () => Array.from({ length: rim }, (_, i) => (i * 360) / rim),
    [rim],
  );
  return (
    <svg viewBox="0 0 100 100" className="h-full w-auto shrink-0" aria-hidden="true">
      <circle cx="50" cy="50" r="45" fill="none" stroke={tint("cyan", 16)} strokeWidth="1.5" />
      {marks.map((a) => (
        <line
          key={a}
          x1={px(a, 37)}
          y1={py(a, 37)}
          x2={px(a, 45)}
          y2={py(a, 45)}
          stroke={tint("cyan", 30)}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}

      {/* The one that comes round while you are watching */}
      <line
        x1={px(FIRED_ANGLE, 33)}
        y1={py(FIRED_ANGLE, 33)}
        x2={px(FIRED_ANGLE, 47)}
        y2={py(FIRED_ANGLE, 47)}
        stroke={fired ? BRAND_VAR.cyan : tint("cyan", 45)}
        strokeWidth="3"
        strokeLinecap="round"
        className="duration-500 transition-[stroke]"
      />
      {firing && !reduced && (
        <motion.circle
          cx={px(FIRED_ANGLE, 45)}
          cy={py(FIRED_ANGLE, 45)}
          r="7"
          fill={tint("cyan", 45)}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 0], scale: [0.3, 1.6, 2.2] }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          style={{
            transformBox: "view-box",
            transformOrigin: `${px(FIRED_ANGLE, 45)}px ${py(FIRED_ANGLE, 45)}px`,
          }}
        />
      )}

      <motion.g
        initial={false}
        animate={{ rotate: sweep }}
        transition={reduced ? { duration: 0 } : SWEEP}
        style={{ transformBox: "view-box", transformOrigin: "50px 50px" }}
      >
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="14"
          stroke={BRAND_VAR.cyan}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </motion.g>
      <circle cx="50" cy="50" r="3.5" fill={BRAND_VAR.cyan} />
    </svg>
  );
}

export default function Standing({
  layout,
  stage,
  sweep,
  firing,
  fired,
  waiting,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  sweep: number;
  firing: boolean;
  fired: boolean;
  waiting: boolean;
  reduced: boolean;
}) {
  const body = atStage(stage, "body");
  const turning = atStage(stage, "detail");
  return (
    <Bench
      rect={layout.panels.standing}
      stage={stage}
      label={COPY.bench.standing}
      waiting={waiting}
      reduced={reduced}
    >
      <span className="flex min-h-0 flex-1 items-stretch gap-3">
        <Part show={body} i={0} reduced={reduced} className="flex min-h-0 shrink-0">
          <Dial
            rim={layout.rim}
            sweep={turning ? sweep : 0}
            firing={firing}
            fired={fired}
            reduced={reduced}
          />
        </Part>

        <span className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          {ORDERS.map((order, i) => {
            const done = fired && i === FIRED_ORDER;
            return (
              <Part
                key={order}
                show={body}
                i={i + 1}
                reduced={reduced}
                className="flex min-w-0 items-center gap-2"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full duration-500 transition-[background-color]"
                  style={{ backgroundColor: tint("cyan", done ? 70 : 30) }}
                  aria-hidden="true"
                />
                <span className="truncate text-base leading-none text-foreground">{order}</span>
                {done && (
                  <span className="ml-auto flex shrink-0 items-center gap-1.5 text-base leading-none text-brand-cyan">
                    <DrawCheck reduced={reduced} className="h-3.5 w-3.5" />
                    <span className="hidden truncate md:inline">{COPY.standing.fired}</span>
                  </span>
                )}
              </Part>
            );
          })}
        </span>
      </span>
    </Bench>
  );
}
