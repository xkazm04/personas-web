"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "./ConceptFigure";
import { useConceptFigure } from "./useConceptFigure";
import type { Step } from "./useSequencer";

const STATES = ["out", "cable", "in", "flow"] as const;
type S = (typeof STATES)[number];

const SOCKETS = [72, 148, 256];
const SCREWS = [
  [15.5, 15.5],
  [295.5, 15.5],
  [15.5, 212.5],
  [295.5, 212.5],
];
const PLUGS = [
  { x: 72, k: "in", hl: "M64.5 81.5a9 9 0 0 1 7-4.5" },
  { x: 148, k: "out", hl: "M140.5 81.5a9 9 0 0 1 7-4.5" },
];

/** C2: a cable joins two inside sockets, so data loops locally; the Internet socket stays capped. */
export default function PatchBay() {
  const { t } = useTranslation();
  const c = t.landingNext.concepts;
  const p = c.patch;
  const [loop, setLoop] = useState(true);

  const script = useCallback(
    (api: { add: (s: S) => void }): Step[] => [
      350,
      () => api.add("out"),
      450,
      () => api.add("cable"),
      850,
      () => api.add("in"),
      450,
      () => {
        api.add("flow");
        setLoop(true);
      },
    ],
    [],
  );

  const figure = useConceptFigure<S>({
    all: STATES,
    script,
    onReset: () => setLoop(false),
    onFinish: () => setLoop(true),
  });

  return (
    <ConceptFigure
      id="patch"
      index="C2"
      title={p.title}
      line={p.line}
      description={p.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
    >
      <svg className="ln-ci-svg" viewBox="0 0 320 240" aria-hidden="true" focusable="false">
        <rect className="ln-ci-lip" x="8" y="11" width="304" height="221" rx="16" />
        <rect className="ln-ci-body" x="8" y="8" width="304" height="221" rx="16" />
        <path className="ln-ci-edge-hl" d="M24 9.4h272" />
        {SCREWS.map(([x, y]) => (
          <use key={`${x}-${y}`} href="#ci-s-screw" x={x} y={y} width="9" height="9" />
        ))}
        <text className="ln-ci-silk" x="32" y="24.5">{p.panel}</text>
        <path className="ln-ci-p-div" d="M204 40V206" />
        <path className="ln-ci-p-tracehl" d="M72 75V59Q72 51 80 51H140Q148 51 148 59V75" />
        <path className="ln-ci-p-trace" d="M72 74V58Q72 50 80 50H140Q148 50 148 58V74" />
        <text className="ln-ci-silk" x="110" y="43" textAnchor="middle">{p.inside}</text>
        {SOCKETS.map((x) => (
          <g key={x}>
            <circle className="ln-ci-nut" cx={x} cy="86" r="13.5" />
            <circle className="ln-ci-ring" cx={x} cy="86" r="9" />
            <circle className="ln-ci-hole" cx={x} cy="86" r="4.6" />
          </g>
        ))}
        <text className="ln-ci-silk ln-ci-silk--ink" x="51" y="90.5" textAnchor="end">{p.in}</text>
        <text className="ln-ci-silk ln-ci-silk--ink" x="168" y="90.5">{p.out}</text>
        <text className="ln-ci-silk ln-ci-silk--ink" x="256" y="63" textAnchor="middle">{p.internet}</text>
        <path className="ln-ci-p-cable" pathLength="100" d="M148 96C148 190 72 190 72 96" />
        <path className="ln-ci-p-cable ln-ci-p-cablehl" pathLength="100" d="M146.4 96C146.4 186.8 73.6 186.8 73.6 96" />
        <path className="ln-ci-p-pulse" pathLength="100" d="M148 86V96C148 190 72 190 72 96V58Q72 50 80 50H140Q148 50 148 58Z" />
        {PLUGS.map((pl) => (
          <g key={pl.k} className={`ln-ci-p-plug ln-ci-p-plug--${pl.k}`}>
            <circle className="ln-ci-p-head" cx={pl.x} cy="86" r="11" />
            <circle className="ln-ci-p-knurl" cx={pl.x} cy="86" r="9.6" />
            <circle className="ln-ci-p-headtop" cx={pl.x} cy="86" r="5.6" />
            <path className="ln-ci-p-headhl" d={pl.hl} />
          </g>
        ))}
        <path className="ln-ci-p-tether" d="M266 93Q279 99 283 107" />
        <circle className="ln-ci-p-rivet" cx="284" cy="108.5" r="3.2" />
        <circle className="ln-ci-p-cap" cx="256" cy="86" r="12.2" />
        <rect className="ln-ci-p-capbar" x="248.5" y="84.2" width="15" height="3.6" rx="1.8" />
        <path className="ln-ci-p-headhl" d="M248.5 80a9.5 9.5 0 0 1 6.5-4" style={{ strokeOpacity: 0.35 }} />
        <text className="ln-ci-silk" x="256" y="124" textAnchor="middle">{p.capped}</text>
        <text className="ln-ci-silk" x="256" y="147.5" textAnchor="middle">{p.telemetry}</text>
        <rect className="ln-ci-bezel" x="216" y="154" width="80" height="44" rx="6" />
        <rect className="ln-ci-lcd" x="219" y="157" width="74" height="38" rx="4" />
        <text className="ln-ci-lcdt ln-ci-lcdt--dim" x="225" y="171">{p.sent}</text>
        <text className="ln-ci-lcdt" x="288" y="189.5" textAnchor="end" style={{ fontSize: 18 }}>000000</text>
        <rect className="ln-ci-scan" x="219" y="157" width="74" height="38" rx="4" />
        <g className="ln-ci-led">
          <circle className="ln-ci-led-well" cx="229" cy="211" r="4.6" />
          <circle className="ln-ci-led-lens" cx="229" cy="211" r="3" />
        </g>
        <text className="ln-ci-silk" x="239" y="215.5">{p.tx}</text>
        <g className={`ln-ci-led ln-ci-p-loop${loop ? " ln-ci-led--ok" : ""}`}>
          <circle className="ln-ci-led-well" cx="38" cy="202" r="4.6" />
          <circle className="ln-ci-led-lens" cx="38" cy="202" r="3" />
        </g>
        <text className="ln-ci-silk" x="48" y="206.5">{p.loop}</text>
      </svg>
    </ConceptFigure>
  );
}
