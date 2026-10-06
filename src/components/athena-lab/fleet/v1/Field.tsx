"use client";

import { atStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { EDITED_TASK, TOOLS } from "./copy";
import type { SceneState } from "./data";
import type { FieldLayout } from "./layout";
import BranchNode from "./BranchNode";
import PlanBar from "./PlanBar";
import ResultCard from "./ResultCard";
import Sentence from "./Sentence";
import Spotlight from "../shared/Spotlight";
import TaskCard from "./TaskCard";
import ThreadField from "./ThreadField";

/**
 * Everything on the field, placed from one set of design-px rects.
 *
 * Nothing here decides WHEN anything happens: every piece reads its stage off
 * the `SceneState` that `data.ts` derives from the tick. This file only knows
 * WHERE things are and what feeds what.
 *
 * Three layers, back to front: the key light, the threads, the panels. A
 * thread that has to pass a card goes behind it, the way a wiring diagram does.
 */
export default function Field({
  scene,
  act,
  layout,
  reduced,
}: {
  scene: SceneState;
  act: 0 | 1 | 2;
  layout: FieldLayout;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="absolute inset-0">
      <Spotlight at={layout.light[act]} reduced={reduced} />
      <ThreadField
        layout={layout}
        request={scene.request}
        tasks={scene.tasks}
        result={scene.result}
        gathered={scene.gathered}
        reduced={reduced}
      />

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
          tool={TOOLS[i]}
          stage={scene.tasks[i]}
          progress={scene.progress[i]}
          waiting={scene.slotGhosts}
          editable={scene.plan === "proposed" && i === EDITED_TASK}
          edited={scene.edited}
          reduced={reduced}
        />
      ))}

      <ResultCard rect={layout.result} stage={scene.result} waiting={scene.resultGhost} reduced={reduced} />

      {/* She sits over the threads she is drawing, under nothing */}
      <BranchNode
        at={layout.branch}
        awake={atStage(scene.request, "chosen")}
        busy={atStage(scene.request, "chosen") && scene.plan !== "done"}
        reduced={reduced}
      />
    </div>
  );
}
