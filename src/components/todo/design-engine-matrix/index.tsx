"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  CELLS,
  type CellKey,
  type CellDef,
  usePersonaMatrixBuild,
} from "../designMatrixShared";
import MatrixTile from "./components/MatrixTile";
import IntentTile from "./components/IntentTile";

const CELL_BY_KEY: Record<CellKey, CellDef> = Object.fromEntries(
  CELLS.map((c) => [c.key, c]),
) as Record<CellKey, CellDef>;

export default function DesignEngineMatrix() {
  const { statuses, phase, userTyped, replay, sectionRef } =
    usePersonaMatrixBuild();

  const filledCount = Object.values(statuses).filter(
    (s) => s.state === "filled",
  ).length;

  return (
    <div>
      <div ref={sectionRef} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-6xl"
      >
        <div className="force-dark rounded-2xl border border-foreground/[0.08] bg-background/80 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between border-b border-foreground/[0.06] px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple/15">
                <Sparkles className="h-5 w-5 text-brand-purple" />
              </div>
              <div>
                <div className="text-base font-semibold text-foreground">
                  Persona Matrix
                </div>
                <div className="text-base font-mono text-foreground/65">
                  intent at center · 8 dimensions radiate outward
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  phase === "running"
                    ? "bg-brand-amber animate-pulse"
                    : phase === "done"
                      ? "bg-brand-emerald"
                      : "bg-foreground/20"
                }`}
              />
              <span className="text-base font-mono uppercase tracking-wider text-foreground/70">
                {phase === "running"
                  ? "building"
                  : phase === "done"
                    ? "ready to deploy"
                    : "idle"}
              </span>
              {phase === "done" && (
                <button
                  onClick={replay}
                  className="text-base font-mono text-brand-cyan/80 hover:text-brand-cyan transition-colors"
                >
                  replay
                </button>
              )}
            </div>
          </div>

          <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <MatrixTile def={CELL_BY_KEY.tasks} status={statuses.tasks} />
            <MatrixTile def={CELL_BY_KEY.apps} status={statuses.apps} />
            <MatrixTile def={CELL_BY_KEY.triggers} status={statuses.triggers} />

            <MatrixTile def={CELL_BY_KEY.messages} status={statuses.messages} />
            <IntentTile
              userTyped={userTyped}
              phase={phase}
              filledCount={filledCount}
            />
            <MatrixTile def={CELL_BY_KEY.review} status={statuses.review} />

            <MatrixTile def={CELL_BY_KEY.memory} status={statuses.memory} />
            <MatrixTile def={CELL_BY_KEY.errors} status={statuses.errors} />
            <MatrixTile def={CELL_BY_KEY.events} status={statuses.events} />
          </div>

          <div className="flex items-center justify-between border-t border-foreground/[0.06] px-5 py-2.5 bg-foreground/[0.01]">
            <div className="flex items-center gap-2 text-base font-mono uppercase tracking-wider text-foreground/60">
              <span className="tabular-nums text-foreground/90 font-semibold">
                {filledCount}/{CELLS.length}
              </span>
              <span>cells resolved</span>
            </div>
            <span className="text-base font-mono uppercase tracking-wider text-foreground/60">
              {phase === "done" ? "deploy-ready" : "radiate from center"}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
