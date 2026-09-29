"use client";

import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "../ConceptFigure";
import { Arrow, at, BpPan, useBpRun } from "./bp-parts";

/** Sheet A-04: a run breaks, a retry arc bridges it, then the revision cloud and the coaching note in red. */
export default function BpHeal() {
  const { t } = useTranslation();
  const c = t.landingNext.conceptsBlueprint;
  const h = c.heal;
  const figure = useBpRun();

  return (
    <ConceptFigure
      id="heal"
      index={h.no}
      title={h.title}
      line={h.line}
      description={h.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
      actions={<BpPan text={c.pan} />}
    >
      <svg className="ln-bpf" viewBox="0 0 640 400" aria-hidden="true" focusable="false">
        <text className="ln-bp-tt ln-bp-f" style={at(0)} x="20" y="40">{h.header}</text>
        <path className="ln-bp-l ln-bp-l3 ln-bp-p" pathLength={1} style={at(.2, .6)} d="M56 196H222" />
        <circle className="ln-bp-k ln-bp-f" style={at(.1)} cx="56" cy="196" r="8" />
        <text className="ln-bp-f" style={at(.2)} x="40" y="240">{h.start}</text>
        <path className="ln-bp-l ln-bp-l2 ln-bp-f" style={at(.8)} d="M218 178l9 9-9 9 9 9M282 178l-9 9 9 9-9 9" />
        <path className="ln-bp-l ln-bp-r ln-bp-l2 ln-bp-f" style={at(.85)} d="M241 187l18 18M259 187l-18 18" />
        <text className="ln-bp-rd ln-bp-f" style={at(.9)} x="262" y="266" textAnchor="middle">{h.failed}</text>
        <path className="ln-bp-l ln-bp-l2 ln-bp-p" pathLength={1} style={at(1.15, .8)} d="M200 196C200 112 300 112 300 182" />
        <Arrow x={300} y={190} dir="d" delay={1.95} />
        <text className="ln-bp-tk ln-bp-f" style={at(1.6)} x="250" y="106" textAnchor="middle">{h.retry}</text>
        <path className="ln-bp-l ln-bp-l3 ln-bp-p" pathLength={1} style={at(1.9, .6)} d="M278 196H584" />
        <circle className="ln-bp-l ln-bp-l2 ln-bp-pp ln-bp-f" style={at(2.3)} cx="584" cy="196" r="9" />
        <path className="ln-bp-l ln-bp-l2 ln-bp-f" style={at(2.4)} d="M579 196l4 4 7-8" />
        <text className="ln-bp-f" style={at(2.4)} x="584" y="240" textAnchor="middle">{h.done}</text>
        <text className="ln-bp-tk ln-bp-f" style={at(2.2)} x="430" y="180" textAnchor="middle">{h.healedVia}</text>
        <path
          className="ln-bp-l ln-bp-r ln-bp-p"
          pathLength={1}
          style={at(2.7, .9)}
          d="M196 214c-14-8-10-30 6-30 0-22 26-30 38-16 10-18 38-16 42 4 18-4 30 14 20 28 12 10 4 32-14 30-4 18-30 22-40 8-12 14-38 8-38-10-16 2-24-12-14-14z"
        />
        <path className="ln-bp-l ln-bp-r ln-bp-f" style={at(3.3)} d="M346 106l15 26h-30z" />
        <text className="ln-bp-rd ln-bp-f" style={at(3.3)} x="346" y="128" textAnchor="middle">{h.revision}</text>
        <path className="ln-bp-l ln-bp-r ln-bp-l0 ln-bp-p" pathLength={1} style={at(3.4, .4)} d="M206 232V296" />
        <text className="ln-bp-tk ln-bp-f" style={at(3.5)} x="40" y="318">{h.noteHead}</text>
        <text className="ln-bp-hand ln-bp-f" style={at(3.7)} x="40" y="352">{h.note1}</text>
        <text className="ln-bp-hand ln-bp-f" style={at(3.9)} x="40" y="382">{h.note2}</text>
      </svg>
    </ConceptFigure>
  );
}
