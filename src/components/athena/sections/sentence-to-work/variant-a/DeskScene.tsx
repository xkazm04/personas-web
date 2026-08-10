"use client";

import { Composer } from "./modules/Composer";
import { ConfirmControl } from "./modules/ConfirmControl";
import { PlanCard } from "./modules/PlanCard";
import { PlanStep } from "./modules/PlanStep";
import { ResultCard } from "./modules/ResultCard";
import { WorkBoard, WorkTile } from "./modules/WorkBoard";
import { COPY, EDIT_ROW, layoutFor, type SceneState } from "./data";

/**
 * Everything on the canvas — a real product screen, not a diagram: a request
 * bar, a plan you can read and change, the control that starts it, the board
 * where several pieces of work run beside each other, and what comes back.
 *
 * Nothing here decides WHEN anything appears or changes: every module reads
 * its STAGE off the `SceneState` that `data.ts` derives from the tick, and
 * composes itself from that. This file only knows how each stage LOOKS.
 *
 * Every module is placed from the same percent rects the corner brackets and
 * Athena read (`./layout`), and its box is mounted for the whole loop, so
 * composing can never move anything: the ghost occupies the exact final rect
 * and the content builds inside it. `compact` (md breakpoint) swaps the two
 * columns for one and shows fewer steps and fewer tiles — never smaller type.
 */
export function DeskScene({
  scene,
  compact,
  reduced,
  epoch,
}: {
  scene: SceneState;
  compact: boolean;
  reduced: boolean;
  epoch: number;
}) {
  const L = layoutFor(compact);
  const { stage, lockedId } = scene;
  return (
    <div className="absolute inset-0">
      <Composer
        rect={L.composer}
        stage={stage.composer}
        locked={lockedId === "ask"}
        reduced={reduced}
        epoch={epoch}
      />

      <PlanCard
        rect={L.plan}
        stage={stage.plan}
        locked={lockedId === "plan"}
        compact={compact}
        reduced={reduced}
      />
      {L.planRows.map((rect, i) => (
        <PlanStep
          key={COPY.plan.steps[i].n}
          rect={rect}
          step={COPY.plan.steps[i]}
          index={i}
          stage={stage.plan}
          locked={lockedId === "edit" && i === EDIT_ROW}
          editable={i === EDIT_ROW}
          editHinted={scene.editHinted}
          edited={scene.edited}
          reduced={reduced}
        />
      ))}
      <ConfirmControl
        rect={L.confirm}
        stage={stage.confirm}
        beckoning={scene.beckoning}
        reduced={reduced}
      />

      <WorkBoard
        rect={L.board}
        stage={stage.board}
        locked={lockedId === "work"}
        compact={compact}
        reduced={reduced}
      />
      {L.tiles.map((rect, i) => (
        <WorkTile
          key={COPY.board.tiles[i].label}
          rect={rect}
          tile={COPY.board.tiles[i]}
          index={i}
          stage={stage.board}
          reduced={reduced}
        />
      ))}

      <ResultCard rect={L.result} stage={stage.result} reduced={reduced} />
    </div>
  );
}
