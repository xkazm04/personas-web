"use client";

import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "../ConceptFigure";
import { at, BpPan, useBpRun } from "./bp-parts";

/** Sheet A-03: run 1 in pencil; only the stretches that worked are projected down to a straight run 12. */
export default function BpMemory() {
  const { t } = useTranslation();
  const c = t.landingNext.conceptsBlueprint;
  const m = c.memory;
  const figure = useBpRun();

  return (
    <ConceptFigure
      id="memory"
      index={m.no}
      title={m.title}
      line={m.line}
      description={m.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
      actions={<BpPan text={c.pan} />}
    >
      <svg className="ln-bpf" viewBox="0 0 640 400" aria-hidden="true" focusable="false">
        <text className="ln-bp-tt ln-bp-f" style={at(0)} x="20" y="40">{m.run1}</text>
        <circle className="ln-bp-l ln-bp-l2 ln-bp-pp ln-bp-f" style={at(.1)} cx="56" cy="120" r="8" />
        <path className="ln-bp-l ln-bp-rough ln-bp-p" pathLength={1} style={at(.2, 2)} d="M56 120H150V66H250V120H330V174H410V120H470V66H530V120H586" />
        <path className="ln-bp-l ln-bp-r ln-bp-l2 ln-bp-f" style={at(.7)} d="M191 57l18 18M209 57l-18 18" />
        <path className="ln-bp-l ln-bp-r ln-bp-l2 ln-bp-f" style={at(1.35)} d="M361 165l18 18M379 165l-18 18" />
        <path className="ln-bp-l ln-bp-l2 ln-bp-f" style={at(2)} d="M586 132V84l24 9-24 9" />
        <path className="ln-bp-l ln-bp-l0 ln-bp-dsh ln-bp-f" style={at(2.3)} d="M56 132V316M150 132V316M250 132V316M330 132V316M410 132V316M470 132V316M530 132V316M586 132V316" />
        <rect className="ln-bp-pp ln-bp-f" style={at(2.4)} x="120" y="206" width="400" height="30" />
        <text className="ln-bp-tk ln-bp-f" style={at(2.45)} x="320" y="228" textAnchor="middle">{m.memory}</text>
        <text className="ln-bp-tt ln-bp-f" style={at(2.6)} x="20" y="290">{m.run12}</text>
        <circle className="ln-bp-k ln-bp-f" style={at(2.8)} cx="56" cy="328" r="8" />
        <path className="ln-bp-l ln-bp-l3 ln-bp-p" pathLength={1} style={at(2.9, .6)} d="M56 328H584" />
        <path className="ln-bp-l ln-bp-l2 ln-bp-f" style={at(3.4)} d="M586 340V292l24 9-24 9" />
        <path className="ln-bp-k ln-bp-f" style={at(3.4)} d="M586 292l24 9-24 9z" />
        <text className="ln-bp-tk ln-bp-f" style={at(3.6)} x="20" y="384">{m.foot}</text>
      </svg>
    </ConceptFigure>
  );
}
