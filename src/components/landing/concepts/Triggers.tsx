"use client";

import { useCallback, useRef, useState } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "./ConceptFigure";
import TriggersArt from "./TriggersArt";
import TriggerSelector from "./TriggerSelector";
import { TRIGGER_DEFAULT, TRIGGER_KEYS } from "./triggers-data";
import { useConceptFigure } from "./useConceptFigure";
import { useSequencer, type Step } from "./useSequencer";
import type { LampState } from "./FigureLamp";

/** Figure 5: any of ten trigger types wakes an agent; the visitor can pick one. */
export default function TriggersFigure() {
  const { t } = useTranslation();
  const c = t.landingNext.conceptsB;
  const still = useStillMotion();
  const [cur, setCur] = useState(TRIGGER_DEFAULT);
  const [lamp, setLamp] = useState<LampState>("ok");
  const [zap, setZap] = useState(0);
  const [running, setRunning] = useState(false);
  const [said, setSaid] = useState("");
  const touched = useRef(false);
  const seq = useSequencer();

  /** One firing: pulse down the wire, agent runs, settles. `guard` lets a visitor's pick cancel autoplay. */
  const fire = (guard: boolean): Step[] => {
    const g = (fn: () => void) => () => { if (!guard || !touched.current) fn(); };
    return [
      g(() => { setZap((z) => z + 1); setRunning(false); setLamp(null); }),
      470, g(() => { setRunning(true); setLamp("ok"); }),
      1500, g(() => setRunning(false)),
    ];
  };

  const script = useCallback((): Step[] => {
    touched.current = false;
    const steps: Step[] = [400];
    for (const i of [1, 3, 5, 7]) {
      steps.push(() => { if (!touched.current) setCur(i); }, 520, ...fire(true), 200);
    }
    return steps;
  }, []);

  const figure = useConceptFigure<never>({
    all: [],
    script,
    onReset: () => { setCur(0); setRunning(false); setLamp(null); setZap(0); },
  });

  const pick = (i: number) => {
    touched.current = true;
    setCur(i);
    setSaid(c.triggers.woken.replace("{name}", c.triggers[TRIGGER_KEYS[i]]));
    seq.cancel();
    if (still) { setRunning(false); setLamp("ok"); return; }
    seq.run([460, ...fire(false)]);
  };

  const names = TRIGGER_KEYS.map((k) => c.triggers[k]);
  return (
    <ConceptFigure
      id="triggers"
      index="05"
      title={c.triggers.title}
      line={c.triggers.line}
      description={c.triggers.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
      controls={
        <>
          <TriggerSelector label={c.triggers.group} names={names} cur={cur} onPick={pick} />
          <p className="ln-sr" aria-live="polite">{said}</p>
        </>
      }
    >
      <TriggersArt c={c.triggers} cur={cur} name={names[cur].toUpperCase()} lamp={lamp} zap={zap} running={running} />
    </ConceptFigure>
  );
}
