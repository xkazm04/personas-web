"use client";

import { atStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { EDITED_TASK } from "./copy";
import type { SceneState } from "./data";
import type { FieldLayout } from "./layout";
import BranchNode from "./BranchNode";
import PlanBar from "./PlanBar";
import ResultCard from "./ResultCard";
import Sentence from "./Sentence";
import TaskCard from "./TaskCard";
import ThreadField from "./ThreadField";

/**
 * Everything on the field, placed from one set of percent rects.
 *
 * Nothing here decides WHEN anything happens: every piece reads its stage off
 * the `SceneState` that `data.ts` derives from the tick, and composes itself
 * from that. This file only knows WHERE things are and what feeds what.
 *
 * Two layers, and the order matters: threads render underneath, cards on top.
 * A thread that has to cross a card on its way home therefore passes behind
 * it, which is how a wiring diagram behaves and why the compact layout can
 * route four answers down one gutter without turning into a knot.
 */
export default function Field({
  scene,
  layout,
  reduced,
}: {
  scene: SceneState;
  layout: FieldLayout;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="absolute inset-0">
      <ThreadField
        layout={layout}
        tasks={scene.tasks}
        result={scene.result}
        gathered={scene.gathered}
        reduced={reduced}
      />

      <div className="absolute inset-0">
        <Sentence
          rect={layout.request}
          stage={scene.request}
          clauses={scene.clauses}
          lit={scene.lit}
          reduced={reduced}
        />
        <PlanBar rect={layout.plan} plan={scene.plan} reduced={reduced} />

        {t.athenaPage.fleet.tasks.map((task, i) => (
          <TaskCard
            key={task.title}
            rect={layout.cards[i]}
            tilt={layout.tilt[i]}
            task={task}
            stage={scene.tasks[i]}
            progress={scene.progress[i]}
            waiting={scene.slotGhosts}
            editable={scene.plan === "proposed" && i === EDITED_TASK}
            edited={scene.edited}
            reduced={reduced}
          />
        ))}

        <ResultCard
          rect={layout.result}
          stage={scene.result}
          waiting={scene.resultGhost}
          reduced={reduced}
        />

        {/* She sits over the threads she is drawing, under nothing */}
        <BranchNode
          at={layout.branch}
          awake={atStage(scene.request, "chosen")}
          busy={atStage(scene.request, "chosen") && scene.plan !== "done"}
          reduced={reduced}
        />
      </div>
    </div>
  );
}
