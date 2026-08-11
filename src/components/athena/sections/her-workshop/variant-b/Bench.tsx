"use client";

import { type ReactNode } from "react";
import { tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import type { Rect } from "./layout";
import { Part, Slot } from "./parts";

/**
 * The frame every instrument on the floor shares — and the ONLY thing they
 * share. A bench is a named box with a live area under the name; what fills
 * that area is entirely its own, because the whole claim of this section is
 * that these are different KINDS of machinery, not five copies of one panel.
 *
 * The name arrives with the shell, the contents with the body. So a bench is
 * announced by what kind of work it is before it shows you any, which is the
 * order a person reads a workshop in.
 *
 * `quiet` is for the bench at the edge: same frame, lower light. It is present
 * and it is not the point, and the frame says so without a word.
 */
export default function Bench({
  rect,
  stage,
  label,
  waiting,
  reduced,
  quiet = false,
  wrap = false,
  children,
}: {
  rect: Rect;
  stage: ModuleStage;
  label: string;
  waiting: boolean;
  reduced: boolean;
  quiet?: boolean;
  /** The tall bench at the edge is narrower than its own name. */
  wrap?: boolean;
  children: ReactNode;
}) {
  const shell = atStage(stage, "shell");
  const live = atStage(stage, "detail");
  return (
    <Slot
      rect={rect}
      solid={shell}
      waiting={waiting}
      reduced={reduced}
      // Narrow fields buy their rows back out of the frame, never out of the
      // type: less padding and a tighter gap, same text-base everywhere.
      className="flex flex-col gap-1 overflow-hidden px-2.5 py-1.5 md:gap-1.5 md:px-3 md:py-2"
      style={{
        borderColor: quiet ? tint("cyan", 20) : live ? tint("cyan", 34) : undefined,
        backgroundColor: tint("cyan", quiet ? 3 : live ? 7 : 4),
      }}
    >
      <Part
        show={shell}
        i={0}
        reduced={reduced}
        className={`block shrink-0 leading-snug ${wrap ? "" : "truncate"} ${ANNOTATION_DIM}`}
      >
        {label}
      </Part>
      <span className="relative flex min-h-0 flex-1 flex-col">{children}</span>
    </Slot>
  );
}
