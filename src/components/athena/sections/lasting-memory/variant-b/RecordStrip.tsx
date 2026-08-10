"use client";

import { tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, stepDelay, type ModuleStage } from "@/components/athena/stage/stages";
import { CHATTER, COPY } from "./copy";
import type { FieldLayout } from "./layout";
import { Part, rectStyle, Sheen, Slot, Wash } from "./parts";

/**
 * The floor of the frame: every conversation you have ever had with her.
 *
 * It is the first thing that arrives and the only thing in the section that
 * is framed, because it is the only thing in the section that is a
 * guarantee. Nothing is ever taken out of it — the strip has one job, which
 * is to be visibly longer at the end of the loop than it was at the start,
 * and never shorter at any point in between.
 *
 * The blocks carry the texture of a thread you have been typing in and no
 * type at all. Naming nine conversations at the type floor would need width
 * this strip does not have, and the citation already says which one is which
 * by pointing at it — a wordless join reads faster than a footnote anyway.
 *
 * The last block is the one that opens during the loop. Its waiting outline
 * shows a beat early, in space the strip has been carrying since it arrived:
 * an archive with no room left would be an archive that has to throw
 * something away, and this one always has room.
 */

const BAR = { height: "13%" } as const;

export default function RecordStrip({
  layout,
  stage,
  newStage,
  newGhost,
  wash,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  newStage: ModuleStage;
  newGhost: boolean;
  wash: boolean;
  reduced: boolean;
}) {
  const framed = atStage(stage, "shell");
  const last = layout.blocks.length - 1;

  return (
    <>
      <Slot
        rect={layout.record}
        solid={framed}
        waiting
        reduced={reduced}
        round="rounded-2xl"
        className="backdrop-blur-sm"
        style={{ borderColor: tint("cyan", 20), backgroundColor: tint("cyan", 4) }}
      >
        <Wash on={wash} depth={layout.record.y} reduced={reduced} />
      </Slot>

      <span
        className={`absolute -translate-y-1/2 truncate ${ANNOTATION_DIM}`}
        style={{ left: `${layout.recordLabel.x}%`, top: `${layout.recordLabel.y}%` }}
      >
        <Part show={atStage(stage, "body")} reduced={reduced}>
          <span className="hidden sm:inline">{COPY.zones.record}</span>
          <span className="sm:hidden">{COPY.zones.recordShort}</span>
        </Part>
      </span>

      {layout.blocks.map((rect, j) => {
        const isNew = j === last;
        const solid = isNew ? atStage(newStage, "shell") : atStage(stage, "body");
        const filled = isNew ? atStage(newStage, "body") : atStage(stage, "detail");
        return (
          <div key={j} className="absolute" style={rectStyle(rect)}>
            <div
              className={`absolute inset-0 overflow-hidden rounded-lg border transition-[background-color,border-color] duration-500 ${
                solid ? "" : "border-dashed"
              }`}
              style={{
                borderColor: tint("cyan", solid ? 22 : isNew && newGhost ? 16 : 0),
                backgroundColor: tint("cyan", solid ? 7 : isNew && newGhost ? 3 : 0),
              }}
            >
              {solid && (
                <>
                  <Sheen on={isNew && newStage === "shell"} reduced={reduced} />
                  <Wash on={wash} depth={rect.y} reduced={reduced} />
                  <span className="flex h-full w-full flex-col justify-center gap-[10%] px-[9%]">
                    {CHATTER[j % CHATTER.length].map((w, b) => (
                      <Part
                        key={b}
                        show={filled}
                        i={b}
                        lead={stepDelay(j % 5)}
                        reduced={reduced}
                        className="block rounded-full"
                        style={{ width: `${w}%`, backgroundColor: tint("cyan", 24), ...BAR }}
                      >
                        {null}
                      </Part>
                    ))}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
