"use client";

import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "./ConceptFigure";
import HealArt from "./HealArt";
import { useConceptFigure, type FigureApi } from "./useConceptFigure";
import type { LampState } from "./FigureLamp";
import "./concepts-c456.css";

const STATES = ["jam", "pencil", "wind", "healed", "rest", "note"] as const;
type S = (typeof STATES)[number];

/** Figure 4: the agent hits an error, heals itself on retry, and the coaching note prints. */
export default function HealFigure() {
  const { t } = useTranslation();
  const c = t.landingNext.conceptsB;

  const figure = useConceptFigure<S>({
    all: STATES,
    script: (api: FigureApi<S>) => [
      1100, () => api.add("jam"),
      1400, () => api.add("pencil"),
      700, () => api.add("wind"),
      1900, () => api.add("healed"),
      220, () => api.add("rest"),
      800, () => api.add("note"),
    ],
  });

  const has = (s: S) => figure.states.includes(s);
  const heal = c.heal;
  let msg = heal.running;
  let lamp: LampState = "ok";
  if (has("healed")) msg = heal.healed;
  else if (has("pencil")) { msg = heal.retrying; lamp = "sig"; }
  else if (has("jam")) { msg = heal.error; lamp = "bad"; }

  return (
    <ConceptFigure
      id="heal"
      index="04"
      title={heal.title}
      line={heal.line}
      description={heal.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
    >
      <HealArt c={heal} msg={msg} lamp={lamp} blink={has("jam") && !has("pencil")} />
    </ConceptFigure>
  );
}
