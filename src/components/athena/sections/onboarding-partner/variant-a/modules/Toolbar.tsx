"use client";

import { tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SCENE } from "../copy";
import type { Rect } from "../layout";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { Part } from "./parts";
import { ModuleReveal } from "./shell";

/**
 * The app's content toolbar: breadcrumb trail on the left, filter chips on
 * the right — the texture every list screen in the product carries, and the
 * cheapest way to make the canvas read as a page rather than a diagram.
 *
 * First thing on the canvas to arrive, one beat ahead of the route: the
 * breadcrumb writes itself out crumb by crumb and the filter chips settle in
 * behind it, so the workspace wakes up rather than switching on.
 */
export function Toolbar({
  rect,
  stage,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaPage.onboarding.canvas;
  const Chevron = SCENE.canvas.crumbIcon;
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  return (
    <ModuleReveal
      rect={rect}
      stage={stage}
      reduced={reduced}
      className="flex items-center gap-2"
    >
      <Part show={body} i={0} reduced={reduced} className={`${ANNOTATION_DIM} normal-case`}>
        {c.crumbs[0]}
      </Part>
      <Part show={body} i={1} reduced={reduced} className="flex shrink-0 text-muted-dark">
        <Chevron className="h-4 w-4" aria-hidden="true" />
      </Part>
      <Part show={body} i={2} reduced={reduced} className="truncate text-base text-foreground">
        {c.crumbs[1]}
      </Part>
      <span className="ml-auto hidden items-center gap-1.5 sm:flex">
        {c.filters.map((label, i) => {
          const active = i === SCENE.canvas.filterActive;
          return (
            <Part
              key={label}
              show={detail}
              i={i}
              lead={0.3}
              reduced={reduced}
              className={
                active
                  ? `${CHIP} border-brand-cyan/40 text-brand-cyan`
                  : `${CHIP} hidden border-glass text-muted-dark lg:block`
              }
              style={active ? { backgroundColor: tint("cyan", 12) } : undefined}
            >
              {label}
            </Part>
          );
        })}
      </span>
    </ModuleReveal>
  );
}

/** One filter chip — the active one carries the brand tint. */
const CHIP = "shrink-0 rounded-full border px-2.5 py-0.5 text-base";
