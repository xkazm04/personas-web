"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { ToolGlyph } from "../shared/ToolGlyph";
import { LANE, LANE_SLOTS, TOOLS, TRAY, activityAt, laneRow, tile, type Box } from "./script";

/**
 * The board around the card: your tools tray on the left (the real brand
 * marks), the Running lane on the right where finished agents land. Both are
 * placed from the same percent boxes the cursors aim at.
 */

export const T = "text-[clamp(1rem,1.2cqw,1.4rem)]";
export const at = (b: Box) => ({ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` });

export function Tray({ inUse }: { inUse: boolean[] }) {
  const { t } = useTranslation();
  const v = t.athenaLab.onboarding.v3;
  return (
    <>
      <span className={`absolute ${ANNOTATION_DIM}`} style={{ left: `${TRAY.x + 1}%`, top: `${TRAY.y + 1}%` }}>
        {v.tools}
      </span>
      {TOOLS.map((tool, i) => (
        <span
          key={tool}
          className={`absolute flex items-center gap-3 rounded-xl border px-3 ${T}`}
          style={{
            ...at(tile(i)),
            borderColor: inUse[i] ? tint("cyan", 45) : "var(--border-glass-hover)",
            backgroundColor: inUse[i] ? tint("cyan", 7) : "var(--surface)",
          }}
        >
          <ToolGlyph tool={tool} className="h-[clamp(1.25rem,1.7cqw,1.9rem)] w-[clamp(1.25rem,1.7cqw,1.9rem)]" />
          <span className="font-medium text-foreground">{v.toolNames[i]}</span>
          {inUse[i] && <span className="ml-auto h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: BRAND_VAR.emerald }} />}
        </span>
      ))}
    </>
  );
}

export function Lane({ running, phase, live, reduced }: { running: number; phase: number; live: boolean; reduced: boolean }) {
  const { t } = useTranslation();
  const v = t.athenaLab.onboarding.v3;
  const c = t.athenaPage.onboarding.canvas;
  const rows = [
    { name: c.template.title, when: c.template.schedule },
    { name: c.templateAlt.title, when: c.templateAlt.schedule },
  ];
  return (
    <>
      <span className={`absolute flex items-center gap-2 ${ANNOTATION_DIM}`} style={{ left: `${LANE.x + 1}%`, top: `${LANE.y + 1}%` }}>
        {v.lane}
        <span className="tabular-nums text-brand-cyan">{running}</span>
      </span>
      {Array.from({ length: LANE_SLOTS }, (_, i) => {
        const b = laneRow(i);
        const on = i < running;
        return (
          <span
            key={i}
            className={`absolute flex flex-col justify-center gap-1 rounded-xl border px-3 ${T} ${on ? "" : "border-dashed"}`}
            style={{ ...at(b), borderColor: on ? tint("cyan", 45) : tint("cyan", 18), backgroundColor: on ? tint("cyan", 6) : "transparent" }}
          >
            {on ? (
              <motion.span
                className="flex flex-col gap-1"
                initial={reduced ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: 0.35 }}
              >
                <span className="flex items-center gap-2">
                  <motion.span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: BRAND_VAR.emerald }}
                    animate={live ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
                    transition={live ? { duration: 1.4, repeat: Infinity } : { duration: 0 }}
                  />
                  <span className="font-semibold text-foreground">{rows[i].name}</span>
                  <span className="ml-auto text-muted-dark">{v.running}</span>
                </span>
                <span className="flex items-end gap-3">
                  <span className="whitespace-nowrap text-muted-dark">{rows[i].when}</span>
                  <Activity heights={activityAt(phase, i)} reduced={reduced} />
                </span>
              </motion.span>
            ) : (
              running === 0 && i === 0 && <span className="text-muted-dark">{v.laneEmpty}</span>
            )}
          </span>
        );
      })}
    </>
  );
}

/** A running agent's pulse: ten bars that step one place per tick. */
function Activity({ heights, reduced }: { heights: number[]; reduced: boolean }) {
  return (
    <span className="ml-auto flex h-6 flex-1 items-end justify-end gap-[3px]" aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[5px] origin-bottom rounded-sm"
          style={{
            height: "100%",
            transform: `scaleY(${h / 100})`,
            backgroundColor: tint("cyan", i === heights.length - 1 ? 75 : 35),
            transition: reduced ? undefined : "transform 600ms ease-out",
          }}
        />
      ))}
    </span>
  );
}
