"use client";

import { useRef, type RefObject } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import LnLed from "../shared/LnLed";
import { useAmbientLive } from "../shared/useAmbientLive";
import Cartridge from "./Cartridge";
import { PERSONA_META, fill, pad2 } from "./data";

interface Props {
  index: number;
  bayRef: RefObject<HTMLDivElement | null>;
  running: boolean;
  step: number;
  request: string;
  text: string;
  onStep: (i: number) => void;
}

/** The persona scene's stage: the loaded card, the trigger note, the screen and the step keys. */
export default function SceneDeck({ index, bayRef, running, step, request, text, onStep }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const live = useAmbientLive(rootRef);
  const { t } = useTranslation();
  const r = t.landingNext.rack;
  const p = r.personas[index];
  const meta = PERSONA_META[index];
  return (
    <div ref={rootRef} className={`ln-sc-right${live ? " ln-live" : ""}`}>
      <div className="ln-rig">
        <div className="ln-rig-shadow" />
        <div className="ln-rig-slot" />
        <div className="ln-rig-bay" aria-hidden="true">
          <div ref={bayRef} className={running ? "ln-running" : undefined}>
            <Cartridge key={meta.id} name={p.name} label={p.label} glyph={meta.glyph} color={meta.color} index={pad2(index + 1)} />
          </div>
        </div>
        <div className="ln-deck">
          <i className="ln-screw ln-s1" />
          <i className="ln-screw ln-s2" />
          <i className="ln-screw ln-s3" />
          <i className="ln-screw ln-s4" />
          <div className="ln-grille ln-sc-grille" aria-hidden="true" />
          <div className="ln-sc-trig ln-paper" aria-hidden="true">
            <span className="ln-silk">{r.startsOn}</span>
            <strong>{p.triggerKind}</strong>
            <p>{p.triggerNote}</p>
          </div>
          <div className="ln-lcd ln-sc-lcd">
            <div className="ln-lcd-inner" aria-live="polite">
              <p className="ln-sc-req">{request}</p>
              <p className="ln-sc-step ln-lcd-glow">{step >= 0 ? `${pad2(step + 1)} ${r.stepNames[step]}` : ""}</p>
              <p className="ln-sc-text">{text}</p>
            </div>
          </div>
          <div className="ln-sc-keys" role="group" aria-label={r.stepsLabel}>
            {r.stepKeys.map((k, i) => (
              <button
                key={k}
                type="button"
                className="ln-stepkey"
                aria-current={i === step ? "step" : undefined}
                aria-label={fill(r.stepAria, { n: i + 1, name: r.stepNames[i].toLowerCase() })}
                onClick={() => onStep(i)}
              >
                <LnLed state={i <= step ? "on" : "off"} />
                <span>{k}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <span className="ln-caption">{r.sceneCaption}</span>
    </div>
  );
}

