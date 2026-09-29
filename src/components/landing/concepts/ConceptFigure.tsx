"use client";

import type { ReactNode } from "react";
import { LnKeyButton } from "../shared/LnKey";
import type { ConceptFigureState } from "./useConceptFigure";

interface Props<S extends string> {
  /** Stable key: becomes `data-ci` (CSS hooks) and the heading id. */
  id: string;
  /** Two-digit index shown in the small badge, e.g. "01". */
  index: string;
  title: string;
  line: string;
  /** A text description of what the animation shows, for screen readers. */
  description: string;
  /** "Stylised illustration": drawn art that could pass as product UI is labelled. */
  stylisedLabel: string;
  replayLabel: string;
  /** Result of `useConceptFigure` for this figure. */
  figure: ConceptFigureState<S>;
  /** The stage art: an `<svg className="ln-ci-svg">` in the figure's own viewBox. */
  children: ReactNode;
  /** Interactive controls laid over the stage. They sit beside the `img` art, not inside it, so they stay reachable. */
  controls?: ReactNode;
  /** Extra keys beside Replay (e.g. the approval key). */
  actions?: ReactNode;
}

/**
 * The shared frame of one concept illustration: plastic card, stage, caption
 * and the Replay control. The stage art is the child; every state the script
 * switches on is mirrored as an `ln-st-<state>` class on the root, so the
 * figure's CSS can key its transitions off them.
 */
export default function ConceptFigure<S extends string>({
  id,
  index,
  title,
  line,
  description,
  stylisedLabel,
  replayLabel,
  figure,
  children,
  controls,
  actions,
}: Props<S>) {
  const { ref, states, play, playing, live, still, snapping } = figure;
  const cls = [
    "ln-ci",
    ...states.map((s) => `ln-st-${s}`),
    live && "ln-ci-on",
    still && "ln-ci-still",
    snapping && "ln-ci-snap",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure ref={ref as React.RefObject<HTMLElement>} className={cls} data-ci={id} aria-labelledby={`ci-${id}-t`}>
      {controls ? (
        <div className="ln-ci-stage">
          <div className="ln-ci-art" role="img" aria-label={description}>{children}</div>
          {controls}
        </div>
      ) : (
        <div className="ln-ci-stage" role="img" aria-label={description}>
          {children}
        </div>
      )}
      <figcaption className="ln-ci-cap">
        <div className="ln-ci-head">
          <span className="ln-ci-no" aria-hidden="true">{index}</span>
          <h3 className="ln-ci-t" id={`ci-${id}-t`}>{title}</h3>
        </div>
        <p className="ln-ci-line">{line}</p>
        <div className="ln-ci-ctl">
          <div className="ln-ci-btns">
            <LnKeyButton
              size="sm"
              icon="i-flip"
              className="ln-ci-turn"
              onClick={play}
              aria-disabled={still || playing || undefined}
            >
              {replayLabel}
            </LnKeyButton>
            {actions}
          </div>
          <span className="ln-caption">{stylisedLabel}</span>
        </div>
      </figcaption>
    </figure>
  );
}
