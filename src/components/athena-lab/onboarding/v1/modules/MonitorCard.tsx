"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { CHART_POINTS, SCENE } from "../data";
import type { Rect } from "../layout";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { StatePill } from "./primitives";
import { Part } from "./parts";
import { ModuleReveal } from "./shell";

/**
 * Monitoring module — the second half of the payoff, and the last thing on the
 * canvas to exist: there is nothing to monitor until the agent has been
 * created. It builds one beat behind the runs table and in three passes of its
 * own — header and live pill (shell), the three headline numbers counting in
 * one after another (body), then the week's line drawing itself beside them
 * (detail).
 *
 * Every box holds its own height from the moment it mounts, so the chart never
 * resizes while the deck fills — the flex column is frozen, only its contents
 * arrive. md+ only.
 *
 * Motion is gated: reduced motion renders the finished deck outright — no
 * draw-in, no cascade, a steady live dot.
 */

const W = 100;
const H = 24;

const linePath = (): string => {
  const step = W / (CHART_POINTS.length - 1);
  return CHART_POINTS.map((y, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${y}`).join(" ");
};

export function MonitorCard({
  rect,
  stage,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  reduced: boolean;
}) {
  const uid = useId();
  const { t } = useTranslation();
  const c = t.athenaPage.onboarding.canvas;
  const Icon = SCENE.canvas.activityIcon;
  const line = linePath();
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  return (
    <ModuleReveal
      rect={rect}
      stage={stage}
      reduced={reduced}
      className="hidden flex-col gap-1.5 rounded-xl border border-glass px-3 py-2 md:flex"
    >
      <span className="flex items-center gap-2">
        <Part show i={0} reduced={reduced} className="flex shrink-0 text-brand-cyan">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </Part>
        <Part show i={1} reduced={reduced} className="truncate text-base font-semibold text-foreground">
          {c.activityLabel}
        </Part>
        <Part show i={2} reduced={reduced} className="ml-auto flex">
          <StatePill tone="brand" label={c.activityPill} pulse reduced={reduced} />
        </Part>
      </span>

      {/* One row: the three numbers on the left, the week drawing itself on
          the right. The live deck stacked them with a bar strip; one stage
          high, the line alone carries the week. */}
      <span className="flex min-h-0 flex-1 items-end gap-3">
        {c.stats.map((s, i) => (
          <Part
            key={s.label}
            show={body}
            i={i}
            lead={0.15}
            reduced={reduced}
            className="flex shrink-0 flex-col"
          >
            <span className="text-lg font-semibold leading-tight tabular-nums text-foreground">
              {s.value}
            </span>
            <span className="text-base leading-tight text-muted-dark">{s.label}</span>
          </Part>
        ))}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full min-w-0 flex-1"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${uid}-spark`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tint("cyan", 35)} />
              <stop offset="100%" stopColor={tint("cyan", 0)} />
            </linearGradient>
          </defs>
          {detail && (
            <>
              <motion.path
                d={`${line} L${W} ${H} L0 ${H} Z`}
                fill={`url(#${uid}-spark)`}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.9, delay: 0.55 }}
              />
              <motion.path
                d={line}
                fill="none"
                stroke={BRAND_VAR.cyan}
                strokeWidth="1.3"
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 1.2, ease: "easeInOut" }}
              />
            </>
          )}
        </svg>
      </span>
    </ModuleReveal>
  );
}
