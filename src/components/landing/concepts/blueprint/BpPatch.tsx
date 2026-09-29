"use client";

import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "../ConceptFigure";
import { Arrow, at, BpPan, useBpRun } from "./bp-parts";

/** Sheet A-02: a section through your machine. The telemetry line stops short of the wall. */
export default function BpPatch() {
  const { t } = useTranslation();
  const c = t.landingNext.conceptsBlueprint;
  const p = c.patch;
  const figure = useBpRun();

  return (
    <ConceptFigure
      id="patch"
      index={p.no}
      title={p.title}
      line={p.line}
      description={p.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
      actions={<BpPan text={c.pan} />}
    >
      <svg className="ln-bpf" viewBox="0 0 640 420" aria-hidden="true" focusable="false">
        <path className="ln-bp-l ln-bp-l0 ln-bp-cl ln-bp-f" style={at(0)} d="M44 34H596" />
        <g className="ln-bp-f" style={at(.3)}>
          <circle className="ln-bp-l ln-bp-pp" cx="30" cy="34" r="15" />
          <circle className="ln-bp-l ln-bp-pp" cx="610" cy="34" r="15" />
          <text className="ln-bp-tk" x="30" y="40" textAnchor="middle">A</text>
          <text className="ln-bp-tk" x="610" y="40" textAnchor="middle">A</text>
        </g>
        <text className="ln-bp-tt ln-bp-f" style={at(.4)} x="320" y="66" textAnchor="middle">{p.section}</text>
        <path className="ln-bp-hz ln-bp-f" style={at(.9)} fillRule="evenodd" d="M60 82H580V372H60ZM80 102H560V352H80Z" />
        <path className="ln-bp-l ln-bp-l2 ln-bp-p" pathLength={1} style={at(.5, .9)} d="M60 82H580V372H60Z" />
        <path className="ln-bp-l ln-bp-p" pathLength={1} style={at(.6, .9)} d="M80 102H560V352H80Z" />
        <g className="ln-bp-f" style={at(1.2)}>
          <circle className="ln-bp-l ln-bp-l2 ln-bp-pp" cx="176" cy="250" r="46" />
          <use className="ln-bp-mk" href="#bp-mk" x="156" y="218" width="40" height="60" />
        </g>
        <text className="ln-bp-tk ln-bp-f" style={at(1.3)} x="176" y="184" textAnchor="middle">{p.agents}</text>
        <g className="ln-bp-f" style={at(1.4)}>
          <rect className="ln-bp-l ln-bp-l2 ln-bp-pp" x="300" y="218" width="84" height="84" />
          <rect className="ln-bp-l ln-bp-l0" x="308" y="226" width="68" height="68" />
          <circle className="ln-bp-l" cx="342" cy="260" r="18" />
          <path className="ln-bp-l ln-bp-l2" d="M342 260l9-9" />
          <path className="ln-bp-l ln-bp-l0" d="M342 242v5M342 273v5M324 260h5M355 260h5" />
        </g>
        <text className="ln-bp-tk ln-bp-f" style={at(1.5)} x="342" y="330" textAnchor="middle">{p.keys}</text>
        <g className="ln-bp-f" style={at(1.6)}>
          <path className="ln-bp-l ln-bp-l2 ln-bp-pp" d="M442 218h70l12 16-12 16h-70z" />
          <circle className="ln-bp-l" cx="454" cy="234" r="4" />
          <text className="ln-bp-tk" x="488" y="240" textAnchor="middle">{p.free}</text>
          <path className="ln-bp-l ln-bp-l0" d="M454 230c-10-20-24-26-40-24" />
        </g>
        <path className="ln-bp-l ln-bp-l2 ln-bp-p" pathLength={1} style={at(1.9, .8)} d="M222 136H486M222 148H486" />
        <path className="ln-bp-l ln-bp-l3 ln-bp-f" style={at(2.6)} d="M492 124V160" />
        <text className="ln-bp-tk ln-bp-f" style={at(2.2)} x="222" y="126">{p.telemetry}</text>
        <text className="ln-bp-tk ln-bp-f" style={at(2.8)} x="492" y="190" textAnchor="middle">{p.capped}</text>
        <path className="ln-bp-l ln-bp-l0 ln-bp-f" style={at(3)} d="M494 106V128M560 106V128" />
        <path className="ln-bp-l ln-bp-l0 ln-bp-p" pathLength={1} style={at(3.1, .4)} d="M496 116H558" />
        <Arrow x={496} y={116} dir="l" delay={3.1} />
        <Arrow x={558} y={116} dir="r" delay={3.5} />
        <text className="ln-bp-f" style={at(3.3)} x="320" y="402" textAnchor="middle">{p.foot}</text>
      </svg>
    </ConceptFigure>
  );
}
