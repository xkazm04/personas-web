"use client";

import { atStage } from "@/components/athena/stage/stages";
import { COPY } from "./copy";
import { NAMED, SUPERSEDED, type SceneState } from "./data";
import Threads from "./Threads";
import KnownCard from "./KnownCard";
import type { FieldLayout } from "./layout";
import RecordStrip from "./RecordStrip";
import Seam from "./Seam";

/**
 * The archive, back to front.
 *
 * Four layers and no camera. The record sits deepest because it is the
 * ground everything else stands on; the citations draw above it so a
 * hairline visibly reaches INTO the strip and lands on one conversation;
 * the cards sit above the citations so a thread passing a resting card goes
 * behind it; and the seam — the light, and her on it — sits above
 * everything, because the card that settles has to be seen passing beneath
 * the surface rather than in front of it.
 *
 * Everything is placed in the same percent space, which is what a scene that
 * never travels buys: type sits in the art at its authored size, at every
 * viewport, with nothing projected and nothing to keep in sync.
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
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
      <div className="absolute inset-0 z-0">
        <RecordStrip
          layout={layout}
          stage={scene.record}
          newStage={scene.newBlock}
          newGhost={scene.newBlockGhost}
          wash={scene.wash}
          reduced={reduced}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <Threads
          layout={layout}
          known={scene.known}
          atRest={scene.atRest}
          linking={scene.linking}
          linkIndex={SUPERSEDED}
          together={scene.together}
          reduced={reduced}
        />
      </div>

      <div className="absolute inset-0 z-20">
        {layout.known.map((geom) => (
          <KnownCard
            key={geom.i}
            geom={geom}
            stage={scene.known[geom.i]}
            ghost={scene.ghosts[geom.i]}
            atRest={scene.atRest[geom.i]}
            quiet={scene.quiet[geom.i]}
            arriving={scene.arriving && scene.known[geom.i] === "chosen"}
            stillHere={scene.stillHere && geom.i === SUPERSEDED}
            announced={scene.announced}
            leftAlone={scene.leftAlone}
            named={geom.i === NAMED}
            wash={scene.wash}
            together={scene.together}
            reduced={reduced}
          />
        ))}
      </div>

      <Seam
        layout={layout}
        caption={scene.present ? COPY.caption[scene.act] : null}
        present={scene.present}
        working={scene.working}
        announcing={scene.act === "announce"}
        together={scene.together}
        useLabel={atStage(scene.known[0], "body")}
        restLabel={atStage(scene.known[NAMED], "body")}
        reduced={reduced}
      />
    </div>
  );
}
