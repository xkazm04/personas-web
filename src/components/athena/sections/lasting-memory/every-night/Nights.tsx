"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { DAYS, nightX, type FieldLayout } from "./layout";
import { Bloom } from "./ink";
import { BandLabel, SKIN, Slot } from "./parts";

/**
 * The middle band: what happens BETWEEN two days - now a strip of night sky.
 *
 * Every night has a moon here from the first frame, drawn as a dashed outline
 * while it is still ahead. A night that runs fills into a lit crescent with a
 * couple of stars beside it; the one night that comes and goes without a pass
 * keeps its dashed outline for good, which is how the scene says the pass is
 * driven by how much was said, not by a clock. A bloom is all a night gets:
 * one quick flare, because the pass costs her a fraction of one reply.
 */

/** Star specks around a lit moon, in moon-widths from its centre. */
const STARS = [
  { x: -1.5, y: -0.55, s: 0.16 },
  { x: 1.35, y: 0.5, s: 0.12 },
  { x: 1.7, y: -0.6, s: 0.1 },
] as const;

export default function Nights({
  layout,
  band,
  nights,
  resting,
  quietNight,
  reduced,
}: {
  layout: FieldLayout;
  band: ModuleStage;
  nights: number[];
  resting: number;
  quietNight: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const open = atStage(band, "shell");

  return (
    <>
      <Slot
        rect={{ x: layout.band.x, y: layout.nightY, w: layout.band.w, h: layout.nightH }}
        solid={open}
        waiting
        reduced={reduced}
        round="rounded-full"
        style={{
          borderColor: tint("cyan", 12),
          background: `linear-gradient(180deg, ${tint("blue", 7)}, ${tint("cyan", 2)})`,
        }}
      />

      {Array.from({ length: DAYS }, (_, i) => {
        const ran = nights[i] === 2;
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${nightX(layout, i)}%`, top: `${layout.nightY + layout.nightH / 2}%` }}
            aria-hidden="true"
          >
            <span className="relative block h-[max(14px,1.5cqw)] w-[max(14px,1.5cqw)]">
              <Bloom on={resting === i && !quietNight} reduced={reduced} />
              <svg viewBox="-12 -12 24 24" className="absolute inset-0 h-full w-full overflow-visible">
                <circle
                  r={10}
                  fill="none"
                  stroke={tint("cyan", open ? (ran ? 0 : nights[i] === 1 ? 40 : 18) : 0)}
                  strokeWidth={1.4}
                  strokeDasharray="3 3"
                  className={SKIN}
                />
                <g transform="rotate(-28)">
                <motion.path
                  d="M 0 -10 A 10 10 0 0 0 0 10 A 5.5 10 0 0 1 0 -10 Z"
                  fill={BRAND_VAR.cyan}
                  initial={false}
                  animate={{ opacity: ran ? 0.9 : 0, scale: ran ? 1 : 0.6 }}
                  transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}
                  style={{ filter: `drop-shadow(0 0 5px ${tint("cyan", 60)})` }}
                />
                </g>
                {STARS.map((s, k) => (
                  <motion.circle
                    key={k}
                    cx={s.x * 20}
                    cy={s.y * 20}
                    r={s.s * 12}
                    fill={BRAND_VAR.cyan}
                    initial={false}
                    animate={{ opacity: ran ? 0.75 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.2 + k * 0.12 }}
                  />
                ))}
              </svg>
            </span>
          </div>
        );
      })}

      {layout.labelNightY !== null && (
        <BandLabel layout={layout} show={atStage(band, "body")} y={layout.labelNightY} reduced={reduced}>
          {t.athenaPage.memory.night}
        </BandLabel>
      )}
    </>
  );
}
