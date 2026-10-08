"use client";

import { motion } from "framer-motion";
import { type BrandKey, BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import type { Tone } from "./data";
import { GROUND, leafPath, polyline, stemPath, stemPoint, type Plant as PlantShape } from "./geometry";

/**
 * One project, as a plant: luminous line art above ground, circuit-straight
 * roots below it. Nothing here carries type - names ride the HTML layer.
 *
 * The plant's health is its posture. Upright and cyan is fine; a lean with
 * leaves folding down is a project slipping - amber when it is waiting its
 * turn, rose when it is the one she goes for, emerald once handled. Wilt is a
 * number the clock owns; the leaves and the lean ease to it on CSS
 * transitions, so posture changes are always gradual - rot never snaps.
 */

export const TONE_KEY: Record<Tone, BrandKey> = {
  waiting: "cyan",
  calm: "cyan",
  attention: "amber",
  worst: "rose",
  handled: "emerald",
};

export default function Plant({
  plant,
  index,
  stage,
  tone,
  wilt,
  settled,
  live,
  reduced,
}: {
  plant: PlantShape;
  index: number;
  stage: ModuleStage;
  tone: Tone;
  wilt: number;
  settled: boolean;
  live: boolean;
  reduced: boolean;
}) {
  const grown = atStage(stage, "shell");
  const leafed = atStage(stage, "body");
  const key = TONE_KEY[tone];
  const quiet = tone === "waiting" || (settled && tone === "calm");
  const ink = tone === "waiting" ? tint("cyan", 38) : tint(key, quiet ? 55 : 90);
  const ease = reduced ? "none" : "transform 1.4s cubic-bezier(.4,0,.2,1), fill .6s, stroke .6s";
  const draw = reduced ? { duration: 0 } : { duration: 1.1, ease: "easeOut", delay: (index % 3) * 0.12 } as const;
  const top = stemPoint(plant, 1);
  const lean = wilt * 16 * (plant.project % 2 ? 1 : -1);

  return (
    <g>
      {/* Roots - what the project stands on */}
      {plant.roots.map((run, r) => (
        // SVG motion elements keep the colour they mounted with, so colour
        // rides a plain parent as currentColor and motion only draws.
        <g key={r} style={{ color: tint("cyan", quiet ? 18 : 26), transition: reduced ? undefined : "color .6s" }}>
          <motion.path
            d={polyline(run)}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: grown ? 1 : 0 }}
            transition={draw}
          />
          <circle
            cx={run[run.length - 1].x}
            cy={run[run.length - 1].y}
            r={4}
            fill={tint("cyan", grown ? 40 : 0)}
            style={{ transition: reduced ? undefined : "fill .6s" }}
          />
        </g>
      ))}

      {/* Above ground: sways as one (ambient, live only), leans as one (wilt) */}
      <motion.g
        style={{ originX: 0.5, originY: 1 }}
        initial={false}
        animate={live ? { rotate: [-1.1, 1.1, -1.1] } : { rotate: 0 }}
        transition={live ? { duration: 5 + (index % 3), repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
      >
        <g
          style={{
            transform: `rotate(${lean}deg)`,
            transformBox: "view-box",
            transformOrigin: `${plant.x}px ${GROUND}px`,
            transition: ease,
          }}
        >
          <g style={{ color: ink, transition: reduced ? undefined : "color .6s" }}>
            <motion.path
              d={stemPath(plant)}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: grown ? 1 : 0 }}
              transition={draw}
            />
          </g>
          {plant.leaves.map((leaf, j) => {
            const at = stemPoint(plant, leaf.t);
            const angle = -leaf.lift * (1 - wilt) + wilt * 62;
            return (
              <path
                key={j}
                d={leafPath(leaf.len)}
                strokeWidth={1.5}
                style={{
                  stroke: ink,
                  fill: tint(key, quiet ? 8 : 18),
                  transformBox: "view-box",
                  transformOrigin: "0 0",
                  transform: `translate(${at.x}px, ${at.y}px) scale(${leaf.side * (leafed ? 1 : 0)}, ${leafed ? 1 : 0}) rotate(${angle}deg)`,
                  transition: ease,
                }}
              />
            );
          })}
          {/* The bud: the project's own light */}
          <circle
            cx={top.x}
            cy={top.y}
            r={leafed ? 7 : 0}
            style={{
              fill: tone === "waiting" ? tint("cyan", 40) : BRAND_VAR[key],
              filter: `drop-shadow(0 0 8px ${tint(key, 70)})`,
              opacity: quiet ? 0.6 : 1,
              transition: reduced ? undefined : "r .5s, fill .6s, opacity .6s",
            }}
          />
        </g>
      </motion.g>
    </g>
  );
}
