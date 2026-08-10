"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage } from "@/components/athena/stage/stages";
import { COPY, FINDINGS, PROJECTS, fmt } from "./copy";
import type { Scene } from "./data";
import { rowRect, type FieldLayout } from "./layout";
import { META, Part, Slot, rectStyle } from "./parts";
import Reading from "./Reading";
import { TOTAL, calmTone, findingRows, rowsFor } from "./readings";

/**
 * The many.
 *
 * A calm lattice of every check on every project you own — dense enough that
 * reading it yourself is visibly not a plan. It composes in two claims rather
 * than one: first the projects (this is the size of what you are responsible
 * for), then every reading on each of them (this is the size of what watching
 * it actually costs).
 *
 * A quiet reading is a fully drawn, fully themed mark with nothing to say. It
 * is never faint-because-unfinished: as the survey passes, calm readings go
 * from unchecked to CHECKED and the field fills in behind her, which is what
 * turns "she looked at all of it" from a caption into something you watched.
 * The few that are not fine flag in place, keep their row, and leave a hollow
 * ring behind when they lift — so the short list never loses its address.
 */

export default function Lattice({
  L,
  scene,
  reduced,
}: {
  L: FieldLayout;
  scene: Scene;
  reduced: boolean;
}) {
  const rows = rowsFor(L);
  const total = TOTAL(L);
  const shell = atStage(scene.lattice, "shell");
  const named = atStage(scene.lattice, "body");
  const filled = atStage(scene.lattice, "detail");

  /** Which cell each finding owns, keyed for a flat lookup while rendering,
   *  plus the rows those cells sit on so a project's name can flag with it. */
  const { flags, hitRows } = useMemo(() => {
    const rowsOf = findingRows(L);
    const map = new Map<string, number>();
    rowsOf.forEach((row, i) => map.set(`${row}:${FINDINGS[i].col}`, i));
    return { flags: map, hitRows: new Set(rowsOf) };
  }, [L]);

  return (
    <>
      <Slot
        rect={L.lattice}
        solid={shell}
        reduced={reduced}
        className="overflow-hidden backdrop-blur-sm"
        style={{ backgroundColor: tint("cyan", 3) }}
      />

      <div
        className="absolute flex items-center gap-3"
        style={rectStyle(L.latticeHead)}
      >
        <Part
          show={shell}
          i={0}
          reduced={reduced}
          className="min-w-0 flex-1 truncate text-base text-foreground sm:text-lg"
        >
          {COPY.lattice.title}
        </Part>
        {/* The count is the claim, so it never shrinks its type to fit — below
            lg it drops words instead, and Athena rides the gutter right beside
            this line at md, where the long form ran into her. */}
        <Part show={shell} i={1} reduced={reduced} className={`shrink-0 whitespace-nowrap ${META}`}>
          <span className="lg:hidden">
            {scene.checkedRows === 0
              ? COPY.lattice.waiting
              : scene.surveying
                ? fmt.checkedShort(scene.checkedRows * L.cols, total)
                : fmt.verdictShort(FINDINGS.length)}
          </span>
          <span className="hidden lg:inline">
            {scene.checkedRows === 0
              ? COPY.lattice.waiting
              : scene.surveying
                ? fmt.checked(scene.checkedRows * L.cols, total)
                : fmt.verdict(total - FINDINGS.length, FINDINGS.length)}
          </span>
        </Part>
      </div>

      {rows.map((project, row) => {
        const checked = scene.checkedRows > row;
        const flagged = checked && hitRows.has(row);
        return (
          <div key={project} className="absolute flex items-center" style={rectStyle(rowRect(L, row))}>
            <Part
              show={named}
              i={row}
              reduced={reduced}
              className={`truncate text-base leading-none duration-500 transition-[color] ${
                flagged ? "" : "text-muted-dark"
              }`}
              style={{ width: `${L.nameFrac * 100}%`, color: flagged ? BRAND_VAR.amber : undefined }}
            >
              {PROJECTS[project]}
            </Part>
            <span
              className="flex h-full flex-1 items-center"
              style={{ marginLeft: `${L.railFrac * 100}%`, gap: `${L.cellGap}%` }}
            >
              {filled &&
                Array.from({ length: L.cols }, (_, col) => {
                  const found = flags.get(`${row}:${col}`);
                  const isFlag = found !== undefined && checked;
                  return (
                    <Reading
                      key={col}
                      tone={calmTone(row, col)}
                      checked={checked}
                      flagged={isFlag}
                      gone={isFlag && scene.lifted}
                      delay={row * 0.055 + col * 0.018}
                      reduced={reduced}
                    />
                  );
                })}
            </span>
          </div>
        );
      })}

      {/* The survey itself — a band riding down the lattice, one project per
          beat. It is the only thing on this side of the field that moves. */}
      <motion.div
        className="pointer-events-none absolute"
        style={rectStyle(rowRect(L, 0))}
        initial={false}
        animate={{
          y: `${Math.max(scene.band, 0) * 100}%`,
          opacity: scene.surveying ? 1 : 0,
        }}
        transition={
          reduced ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 18, mass: 0.6 }
        }
        aria-hidden="true"
      >
        <span
          className="absolute inset-x-[-2%] inset-y-0 rounded-lg"
          style={{
            background: `linear-gradient(180deg, transparent, ${tint("cyan", 16)}, transparent)`,
          }}
        />
        <span
          className="absolute inset-x-[-2%] bottom-0 h-px"
          style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 10, 70) }}
        />
      </motion.div>
    </>
  );
}
