"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "../ConceptFigure";
import { Arrow, at, BpPan, useBpRun } from "./bp-parts";

/** Leader from the end of an underline to the part it asks for (viewBox units). */
const LEAD: Record<number, (x: string, y: number) => string> = {
  1: (x, y) => `M${x} ${y}H320V84H458`,
  2: (x, y) => `M${x} ${y}H343`,
  3: (x, y) => `M${x} ${y}H322V290H343`,
  4: (x, y) => `M${x} ${y}H330V394H604V323`,
};
const UL = [[.55, .35], [.95, .3], [1.3, .35], [1.7, .4]] as const;
const LD = [[.8, .5], [1.15, .35], [1.55, .45], [1.95, .7]] as const;
/** Where each leader ends. The y of leader 2 is the underline's own, so its head is placed by the line. */
const TIP = [
  { x: 458, y: 84, dir: "r" }, { x: 343, y: 171, dir: "r" }, { x: 343, y: 290, dir: "r" }, { x: 604, y: 323, dir: "u" },
] as const;

/** Sheet A-01: the sentence you write; each underlined phrase runs a leader to the part it asks for. */
export default function BpLabel() {
  const { t } = useTranslation();
  const c = t.landingNext.conceptsBlueprint;
  const l = c.label;
  const figure = useBpRun();
  const svg = useRef<SVGSVGElement>(null);

  const lines = [
    { s: l.l1, m: l.m1, k: 1 }, { s: l.l2, m: l.m2, k: 2 }, { s: l.l3, m: l.m3, k: 3 },
    { s: l.l4, m: "", k: 0 }, { s: l.l5, m: "", k: 0 }, { s: l.l6, m: l.m6, k: 4 },
  ];

  // The underline runs under the measured phrase. Written straight to the DOM (no state), redone when fonts land.
  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    let live = true;
    const geo = () => {
      if (!live) return;
      root.querySelectorAll<SVGTextElement>("text[data-k]").forEach((el) => {
        const a = Number(el.dataset.a);
        const n = Number(el.dataset.n);
        const k = Number(el.dataset.k);
        let x0 = Number(el.getAttribute("x"));
        let w = n * 11;
        try {
          if (a > 0) x0 += el.getSubStringLength(0, a);
          const m = el.getSubStringLength(a, n);
          if (m > 0) w = m;
        } catch { /* not rendered yet: keep the estimate */ }
        const y = Number(el.getAttribute("y")) + 7;
        const xe = x0 + w;
        root.querySelector(`[data-ul="${k}"]`)?.setAttribute("d", `M${x0.toFixed(1)} ${y}H${xe.toFixed(1)}`);
        root.querySelector(`[data-ld="${k}"]`)?.setAttribute("d", LEAD[k]((xe + 5).toFixed(1), y));
      });
    };
    geo();
    document.fonts?.ready.then(geo);
    return () => { live = false; };
  }, [l.l1, l.l2, l.l3, l.l6, l.m1, l.m2, l.m3, l.m6]);

  return (
    <ConceptFigure
      id="label"
      index={l.no}
      title={l.title}
      line={l.line}
      description={l.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
      actions={<BpPan text={c.pan} />}
    >
      <svg ref={svg} className="ln-bpf" viewBox="0 0 640 440" aria-hidden="true" focusable="false">
        <g className="ln-bp-f" style={at(0)}>
          <rect className="ln-bp-l ln-bp-pp" x="20" y="50" width="272" height="276" />
          <path className="ln-bp-l ln-bp-l0" d="M20 90H292" />
        </g>
        <text className="ln-bp-tt ln-bp-f" style={at(.05)} x="36" y="78">{l.youWrite}</text>
        <g className="ln-bp-f" style={at(.2)}>
          {lines.map((r, i) => (
            <text
              key={i}
              className="ln-bp-body"
              x="36"
              y={130 + i * 34}
              {...(r.k ? { "data-k": r.k, "data-a": r.s.indexOf(r.m), "data-n": r.m.length } : {})}
            >
              {r.s}
            </text>
          ))}
        </g>
        {UL.map(([d, du], i) => (
          <g key={i}>
            <path className="ln-bp-l ln-bp-l2 ln-bp-p" data-ul={i + 1} pathLength={1} style={at(d, du)} d="M0 0" />
            <path className="ln-bp-l ln-bp-p" data-ld={i + 1} pathLength={1} style={at(LD[i][0], LD[i][1])} d="M0 0" />
            <Arrow x={TIP[i].x} y={TIP[i].y} dir={TIP[i].dir} delay={LD[i][0] + LD[i][1]} />
          </g>
        ))}
        <g className="ln-bp-f" style={at(1.25)}>
          <circle className="ln-bp-l ln-bp-l2 ln-bp-pp" cx="486" cy="84" r="24" />
          <path className="ln-bp-l ln-bp-l2" d="M486 70V84L497 91" />
        </g>
        <text className="ln-bp-tk ln-bp-f" style={at(1.35)} x="518" y="90">{l.daily}</text>
        <g className="ln-bp-f" style={at(1.45)}>
          <rect className="ln-bp-l ln-bp-l2 ln-bp-pp" x="348" y="146" width="44" height="44" />
          <path className="ln-bp-l" d="M356 162h28v18h-28zM356 162l14 10 14-10" />
        </g>
        <text className="ln-bp-tk ln-bp-f" style={at(1.5)} x="370" y="214" textAnchor="middle">{l.inbox}</text>
        <g className="ln-bp-f" style={at(1.95)}>
          <path className="ln-bp-l ln-bp-l2" d="M348 272V308H392V272" />
          <path className="ln-bp-l ln-bp-l0" d="M356 284H384M356 295H384" />
        </g>
        <text className="ln-bp-tk ln-bp-f" style={at(2)} x="370" y="334" textAnchor="middle">{l.drafts}</text>
        <g className="ln-bp-f" style={at(2.55)}>
          <rect className="ln-bp-l ln-bp-l2 ln-bp-pp" x="582" y="274" width="44" height="44" />
          <path className="ln-bp-l" d="M600 286l-3 20M610 286l-3 20M592 293h24M591 300h24" />
        </g>
        <text className="ln-bp-tk ln-bp-f" style={at(2.6)} x="604" y="262" textAnchor="middle">{l.slack}</text>
        <path className="ln-bp-l ln-bp-l0 ln-bp-p" pathLength={1} style={at(2.7, .3)} d="M486 108V162M392 176L429 196M392 290L433 262M541 259L582 283" />
        <circle className="ln-bp-l ln-bp-l2 ln-bp-p" pathLength={1} style={at(2.4, .8)} cx="486" cy="226" r="64" />
        <circle className="ln-bp-l ln-bp-l0 ln-bp-p" pathLength={1} style={at(2.6, .7)} cx="486" cy="226" r="55" />
        <use className="ln-bp-mk ln-bp-f" style={at(2.9)} href="#bp-mk" x="464" y="193" width="44" height="66" />
        <text className="ln-bp-tt ln-bp-f" style={at(3.1)} x="486" y="322" textAnchor="middle">{l.persona}</text>
        <text className="ln-bp-tk ln-bp-f" style={at(3.3)} x="486" y="348" textAnchor="middle">{l.exists}</text>
      </svg>
    </ConceptFigure>
  );
}
