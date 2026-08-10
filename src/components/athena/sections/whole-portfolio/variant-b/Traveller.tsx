"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage } from "@/components/athena/stage/stages";
import { FINDINGS, PROJECTS, fmt, type Finding } from "./copy";
import type { Scene } from "./data";
import { liftPoint, slotCentre, slotHeight, type FieldLayout, type Point } from "./layout";
import OpenCard from "./OpenCard";
import { Sheen } from "./marks";
import { Part, Travel, type Spring } from "./parts";
import { rowOf } from "./readings";

/**
 * One surfaced reading, on its way from a cell to a rank.
 *
 * This is the section's whole motion argument in one component. The reading
 * does not cross-fade from the lattice into the list; it TRAVELS, as one box,
 * through four poses that are pure functions of the tick:
 *
 *   at its cell        invisible, holding the address it will come out of
 *   lifted             out of the plane, still over the row it belongs to
 *   found order        in the list, arranged by nothing better than the order
 *                      she happened to reach it in
 *   rank order         where it belongs — and getting there means physically
 *                      overtaking the ones it is worse than
 *
 * The overtake is choreographed rather than merely permitted: on the sort beat
 * a climbing reading swings OUT of the column toward the lattice — the passing
 * lane — while the one it is passing only eases aside, and both are pulled back
 * into line on the next beat. Two springs, one arc, and four boxes that visibly
 * pass each other instead of four boxes that dissolve into new positions.
 *
 * Severity is deliberately not coloured in until the sort lands. Before that
 * all four look equally alarming, which is exactly how a pile of findings
 * looks before somebody has ranked it.
 */

const LAND: Spring = { type: "spring", stiffness: 48, damping: 13, mass: 0.9 };
const SORT: Spring = { type: "spring", stiffness: 64, damping: 14, mass: 0.8 };
const STILL: Spring = { duration: 0 };

const LAST = FINDINGS.length - 1;

export default function Traveller({
  L,
  finding,
  scene,
  reduced,
}: {
  L: FieldLayout;
  finding: Finding;
  scene: Scene;
  reduced: boolean;
}) {
  const open = scene.opened && finding.rank === 0;
  const ranked = atStage(scene.list, "detail");
  const climbing = finding.found > finding.rank;
  const bow = climbing ? L.bowOut : L.bowIn;

  let at: Point;
  if (scene.sorting) {
    const target = slotCentre(L, finding.rank, false);
    at = { x: target.x + bow, y: target.y };
  } else if (scene.sorted) {
    at = slotCentre(L, finding.rank, scene.opened);
  } else if (scene.landed) {
    at = slotCentre(L, finding.found, false);
  } else {
    at = liftPoint(L, rowOf(L, finding.project), finding.col);
  }

  const heat = ranked ? 1 - finding.rank / LAST : 0.55;
  const spring = reduced ? STILL : scene.sorted ? SORT : LAND;

  return (
    <Travel
      x={at.x}
      y={at.y}
      spring={spring}
      z={20 + (LAST - finding.rank)}
    >
      <motion.div
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${L.pillW}%` }}
        initial={false}
        animate={{ height: `${slotHeight(L, finding.rank, scene.opened)}%` }}
        transition={reduced ? STILL : SORT}
      >
        <motion.div
          className="relative flex h-full w-full flex-col gap-1.5 overflow-hidden rounded-xl border px-3 py-1.5 backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2"
          style={{
            borderColor: tint("amber", 30 + heat * 38),
            backgroundColor: tint("amber", 6 + heat * 9),
            boxShadow: brandShadow("amber", 14 + heat * 16, 16 + heat * 16),
          }}
          initial={reduced ? false : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: scene.lifted ? 1 : 0, scale: scene.lifted ? 1 : 0.5 }}
          transition={reduced ? STILL : { duration: 0.45, ease: "easeOut" }}
        >
          <Sheen on={ranked && finding.rank === 0} reduced={reduced} accent="amber" />

          {/* One header for both shapes — opening grows a box around words that
              were already on screen, instead of swapping in a second component */}
          <span className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <Part
              show={ranked}
              reduced={reduced}
              className="w-4 shrink-0 text-center font-mono text-base tabular-nums"
              style={{ color: BRAND_VAR.amber }}
            >
              {fmt.rank(finding.rank)}
            </Part>
            <span
              className={`min-w-0 shrink-0 truncate text-foreground duration-300 transition-[font-size] ${
                open ? "text-lg sm:text-xl" : "text-base"
              }`}
            >
              {PROJECTS[finding.project]}
            </span>
            <span
              className={`shrink-0 truncate rounded-md border px-2 font-mono text-base ${
                open ? "flex" : "hidden lg:flex"
              }`}
              style={{ borderColor: tint("amber", 42), color: BRAND_VAR.amber }}
            >
              {finding.dimension}
            </span>
            {!open && (
              <span className="min-w-0 flex-1 truncate text-base text-muted-dark">
                {finding.short}
              </span>
            )}
          </span>

          {open && (
            <OpenCard
              finding={finding}
              stage={scene.card}
              told={scene.told}
              action={scene.action}
              reduced={reduced}
            />
          )}
        </motion.div>
      </motion.div>
    </Travel>
  );
}
