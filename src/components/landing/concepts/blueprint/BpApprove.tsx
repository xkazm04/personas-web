"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "../ConceptFigure";
import { useConceptFigure, type FigureApi } from "../useConceptFigure";
import { at, BpPan } from "./bp-parts";

/** The agent walks the four stations (one state each), then waits at the door. */
const STATES = ["run", "n1", "n2", "n3", "door"] as const;
type S = (typeof STATES)[number];

const script = (api: FigureApi<S>) => [
  300, () => api.add("run"),
  1300, () => api.add("n1"),
  1000, () => api.add("n2"),
  1000, () => api.add("n3"),
  1000, () => api.add("door"),
];

/** Sheet A-06: a corridor ending in a door that opens only when you press the stamp. */
export default function BpApprove() {
  const { t } = useTranslation();
  const c = t.landingNext.conceptsBlueprint;
  const a = c.approve;
  const [passed, setPassed] = useState(false);
  const [said, setSaid] = useState("");

  const figure = useConceptFigure<S>({ all: STATES, script, onReset: () => { setPassed(false); setSaid(""); } });

  const toggle = () => {
    const next = !passed;
    setPassed(next);
    setSaid(next ? a.liveApproved : a.liveUndone);
  };

  const stations = [
    [70, a.install, "1"], [170, a.describe, "2"], [270, a.connect, "3"], [370, a.test, "4"],
  ] as const;

  return (
    <ConceptFigure
      id="approve"
      index={a.no}
      title={a.title}
      line={a.line}
      description={a.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
      controls={<p className="ln-sr" aria-live="polite">{said}</p>}
      actions={
        <>
          <button type="button" className="ln-bp-stampbtn" aria-pressed={passed} onClick={toggle}>
            {passed ? a.undo : a.press}
          </button>
          <BpPan text={c.pan} />
        </>
      }
    >
      <svg
        className={`ln-bpf${passed ? " ln-bp-passed" : ""}`}
        viewBox="0 0 640 420"
        aria-hidden="true"
        focusable="false"
      >
        <g className="ln-bp-f" style={at(0)}>
          <path className="ln-bp-hz" d="M20 146H440V160H20ZM20 280H440V294H20ZM440 52H454V160H440ZM440 280H454V388H440Z" />
          <path className="ln-bp-l" d="M20 146H440V52H454V160H20M20 280H440V388H454V280H20" />
        </g>
        <path className="ln-bp-l ln-bp-l0 ln-bp-dsh ln-bp-f" style={at(.3)} d="M36 220H424" />
        {stations.map(([x]) => (
          <circle key={x} className="ln-bp-l ln-bp-pp ln-bp-f" style={at(.3)} cx={x} cy="220" r="17" />
        ))}
        <g className="ln-bp-f" style={at(.4)}>
          {stations.map(([x, name, n]) => (
            <g key={x}>
              <text className="ln-bp-tk" x={x} y="132" textAnchor="middle">{name}</text>
              <text x={x} y="323" textAnchor="middle">{n}</text>
            </g>
          ))}
        </g>
        <text className="ln-bp-tt ln-bp-f" style={at(.5)} x="447" y="40" textAnchor="middle">{a.gate}</text>
        <path className="ln-bp-l ln-bp-l0 ln-bp-dsh ln-bp-f" style={at(.6)} d="M447 280A120 120 0 0 0 567 160" />
        <g className="ln-bp-f" style={at(.6)}>
          <path className="ln-bp-l ln-bp-l3 ln-bp-leaf" d="M447 160V280" />
        </g>
        <circle className="ln-bp-k" cx="447" cy="160" r="4" />
        <text className="ln-bp-tt ln-bp-f" style={at(.7)} x="490" y="104">{a.runsDaily}</text>
        <text className="ln-bp-tk ln-bp-f ln-bp-thld" style={at(.8)} x="490" y="130">{a.held}</text>
        <text className="ln-bp-tk ln-bp-trun" x="490" y="130">{a.running}</text>
        <rect className="ln-bp-l ln-bp-l0 ln-bp-dsh ln-bp-f" style={at(.8)} x="468" y="304" width="158" height="58" />
        <text className="ln-bp-g2 ln-bp-f ln-bp-thld" style={at(.9)} x="547" y="339" textAnchor="middle">{a.yourStamp}</text>
        <g className="ln-bp-stp">
          <g transform="rotate(-7 547 333)">
            <rect className="ln-bp-l ln-bp-r ln-bp-l2" x="476" y="310" width="142" height="46" />
            <rect className="ln-bp-l ln-bp-r ln-bp-l0" x="482" y="316" width="130" height="34" />
            <text className="ln-bp-rd ln-bp-stamp" x="547" y="340" textAnchor="middle">{a.approved}</text>
          </g>
        </g>
        <g className="ln-bp-f" style={at(.5)}>
          <g className="ln-bp-tok">
            <circle className="ln-bp-l ln-bp-l2 ln-bp-pp" cx="70" cy="220" r="15" />
            <path className="ln-bp-k" d="M70 220V208A12 12 0 0 1 82 220ZM70 220H58A12 12 0 0 0 70 232Z" />
          </g>
        </g>
      </svg>
    </ConceptFigure>
  );
}
