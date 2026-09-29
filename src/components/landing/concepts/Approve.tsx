"use client";

import { useCallback, useState } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import ApproveArt from "./ApproveArt";
import ConceptFigure from "./ConceptFigure";
import { LnKeyButton } from "../shared/LnKey";
import { useConceptFigure, type FigureApi } from "./useConceptFigure";
import { useSequencer } from "./useSequencer";
import type { LampState } from "./FigureLamp";

const STATES = ["arrive"] as const;
type S = (typeof STATES)[number];

/** Figure 6: a human approval gate. The change waits until the visitor turns the key. */
export default function ApproveFigure() {
  const { t } = useTranslation();
  const c = t.landingNext.conceptsB;
  const a = c.approve;
  const still = useStillMotion();
  const seq = useSequencer();
  // stage: 0 waiting, 1 key turning, 2 gate open, 3 change inside, 4 done.
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(true);
  const [said, setSaid] = useState("");

  const script = useCallback(
    (api: FigureApi<S>) => [350, () => api.add("arrive"), 650, () => setReady(true)],
    [],
  );

  const figure = useConceptFigure<S>({
    all: STATES,
    script,
    onReset: () => { seq.cancel(); setStage(0); setReady(false); setSaid(""); },
  });

  const approved = stage >= 1;
  const turn = () => {
    if (approved || !ready) return;
    setSaid(a.liveApproved);
    if (still) { setStage(4); return; }
    setStage(1);
    seq.run([1150, () => setStage(2), 650, () => setStage(3), 900, () => setStage(4)]);
  };

  const lcd: [string, string] = !ready ? [a.closed1, a.closed2]
    : stage >= 2 ? [a.approved1, a.approved2] : [a.waiting1, a.waiting2];
  const lamp: LampState = !ready ? null : stage >= 2 ? "ok" : "sig";

  return (
    <ConceptFigure
      id="approve"
      index="06"
      title={a.title}
      line={a.line}
      description={a.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
      controls={<p className="ln-sr" aria-live="polite">{said}</p>}
      actions={
        <LnKeyButton
          size="sm"
          tone="signal"
          className="ln-ci-turn"
          onClick={turn}
          aria-disabled={approved || !ready}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="7.5" cy="12" r="4" />
              <path d="M11.5 12H21M18 12v3.2M21 12v2.4" />
            </g>
          </svg>
          <span>{approved ? a.approved : a.turn}</span>
        </LnKeyButton>
      }
    >
      <ApproveArt c={a} stage={stage} lcd={lcd} lamp={lamp} onPlate={turn} />
    </ConceptFigure>
  );
}
