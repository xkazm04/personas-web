"use client";

import { useCallback, useRef, type CSSProperties } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "./ConceptFigure";
import { useConceptFigure } from "./useConceptFigure";
import type { Step } from "./useSequencer";
import { CUES, HEAD1_END, HEAD2_END, HEAD2_START, JOIN_X, RUN1_PATH, SNAGS } from "./memory-data";

const STATES = ["snag1", "snag2", "r1", "cues", "carry", "r12"] as const;
type S = (typeof STATES)[number];

const tf = (x: number, y: number) => `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
const CUE_PATH = "M-5-17h10v7l-5 5-5-5z";
const SPLICES = [
  { pos: "76.4 63", cls: "ln-ci-m-x1", rot: 12 },
  { pos: "236 83", cls: "ln-ci-m-x2", rot: -10 },
];

/**
 * C3: run 01 drags along a tangled path and snags twice; what worked is carried
 * down to run 12, which goes straight through. The two heads move through refs
 * (attribute writes inside step callbacks), not through state.
 */
export default function Memory() {
  const { t } = useTranslation();
  const c = t.landingNext.concepts;
  const m = c.memory;
  const path = useRef<SVGPathElement>(null);
  const h1 = useRef<SVGGElement>(null);
  const h2 = useRef<SVGGElement>(null);

  const put1 = (x: number, y: number) => h1.current?.setAttribute("transform", tf(x, y));
  const put2 = (x: number, y: number) => h2.current?.setAttribute("transform", tf(x, y));
  const at = (d: number) => {
    const p = path.current;
    if (!p) return;
    const pt = p.getPointAtLength(Math.max(0, Math.min(p.getTotalLength(), d)));
    put1(pt.x, pt.y);
  };
  const clearJolt = () => h1.current?.classList.remove("ln-ci-jolt");

  const script = useCallback((api: { add: (s: S) => void }): Step[] => {
    const len = path.current?.getTotalLength() ?? 0;
    const snags = SNAGS.map((f) => len * f);
    let d = 0;
    let hold = 0;
    let si = 0;
    let x = HEAD2_START;
    const jolt = () => {
      const el = h1.current;
      if (!el) return;
      el.classList.remove("ln-ci-jolt");
      el.getBoundingClientRect(); // force a reflow so the animation restarts
      el.classList.add("ln-ci-jolt");
    };
    return [
      500,
      {
        t: (dt) => {
          if (hold > 0) {
            hold -= dt;
            return false;
          }
          d += dt * 0.21;
          if (si < snags.length && d >= snags[si]) {
            d = snags[si];
            si += 1;
            api.add(si === 1 ? "snag1" : "snag2");
            jolt();
            hold = 700;
          }
          at(d);
          return d >= len;
        },
      },
      () => api.add("r1"),
      500,
      () => api.add("cues"),
      700,
      () => api.add("carry"),
      1450,
      {
        t: (dt) => {
          x = Math.min(HEAD2_END[0], x + dt * 0.34);
          put2(x, HEAD2_END[1]);
          return x >= HEAD2_END[0];
        },
      },
      () => api.add("r12"),
    ];
    // at/put2 only touch refs, which are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const figure = useConceptFigure<S>({
    all: STATES,
    script,
    onReset: () => {
      clearJolt();
      at(0);
      put2(HEAD2_START, HEAD2_END[1]);
    },
    onFinish: () => {
      clearJolt();
      put1(HEAD1_END[0], HEAD1_END[1]);
      put2(HEAD2_END[0], HEAD2_END[1]);
    },
  });

  return (
    <ConceptFigure
      id="memory"
      index="C3"
      title={m.title}
      line={m.line}
      description={m.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
    >
      <svg className="ln-ci-svg" viewBox="0 0 320 240" aria-hidden="true" focusable="false">
        <rect className="ln-ci-cap-lip" x="14" y="13" width="58" height="19" rx="5" />
        <rect className="ln-ci-cap-face" x="14" y="10" width="58" height="19" rx="5" />
        <text className="ln-ci-silk ln-ci-silk--ink" x="43" y="23.8" textAnchor="middle">{m.run1}</text>
        <text className="ln-ci-silk ln-ci-m-status ln-ci-m-s1" x="80" y="23.8">{m.run1Status}</text>
        <rect className="ln-ci-m-band" x="14" y="131" width="292" height="25" rx="12.5" />
        <text className="ln-ci-silk ln-ci-silk--ink" x="110" y="147.8" textAnchor="middle">{m.memory}</text>
        <text className="ln-ci-silk" x="223" y="147.8" textAnchor="middle">{m.worked}</text>
        {CUES.map((q) => (
          <path key={q.x} className="ln-ci-m-carrier" d={`M${q.x} ${q.y + 10}V186`} />
        ))}
        <path ref={path} className="ln-ci-m-tape ln-ci-m-p1" d={RUN1_PATH} />
        <path className="ln-ci-m-tapehl" d={RUN1_PATH} />
        <rect className="ln-ci-m-leader" x="21" y="70" width="10" height="12" rx="2" />
        <path className="ln-ci-m-pole" d="M293 79V48" />
        <path className="ln-ci-m-flag ln-ci-m-flag1" d="M293 48L308 53.5L293 59Z" />
        {SPLICES.map((s) => (
          <g key={s.cls} className="ln-ci-m-xpos" transform={`translate(${s.pos})`}>
            <g className={`ln-ci-m-x ${s.cls}`}>
              <rect className="ln-ci-m-splice" x="-7" y="-7" width="14" height="14" rx="2" transform={`rotate(${s.rot})`} />
              <path className="ln-ci-m-xx" d="M-3.8-3.8L3.8 3.8M3.8-3.8L-3.8 3.8" />
            </g>
          </g>
        ))}
        {CUES.map((q) => (
          <g key={q.x} transform={`translate(${q.x} ${q.y})`}>
            <path className="ln-ci-m-ghost" d={CUE_PATH} />
          </g>
        ))}
        <path className="ln-ci-m-tape" d="M30 196H290" />
        <path className="ln-ci-m-tapehl" d="M30 196H290" />
        {JOIN_X.map((x) => (
          <rect key={x} className="ln-ci-m-join" x={x} y="190" width="6" height="12" rx="1" />
        ))}
        <rect className="ln-ci-m-leader" x="21" y="190" width="10" height="12" rx="2" />
        <path className="ln-ci-m-pole" d="M293 199V168" />
        <path className="ln-ci-m-flag ln-ci-m-flag2" d="M293 168L308 173.5L293 179Z" />
        {CUES.map((q, i) => (
          <g key={q.x} transform={`translate(${q.x} ${q.y})`}>
            <g className="ln-ci-m-cue" style={{ "--ln-dy": `${q.dy}px`, "--ln-dl": `${i * 0.12}s` } as CSSProperties}>
              <path className="ln-ci-m-cuef" d={CUE_PATH} />
            </g>
          </g>
        ))}
        <rect className="ln-ci-cap-lip" x="14" y="213" width="58" height="19" rx="5" />
        <rect className="ln-ci-cap-face" x="14" y="210" width="58" height="19" rx="5" />
        <text className="ln-ci-silk ln-ci-silk--ink" x="43" y="223.8" textAnchor="middle">{m.run12}</text>
        <text className="ln-ci-silk ln-ci-m-status ln-ci-m-s12" x="80" y="223.8">{m.run12Status}</text>
        <g ref={h1} className="ln-ci-m-head ln-ci-m-h1" transform={tf(...HEAD1_END)}>
          <g className="ln-ci-m-jwrap">
            <circle className="ln-ci-m-flash" r="10" />
            <circle className="ln-ci-m-roller" r="7.5" />
            <circle className="ln-ci-m-rdot" r="2.6" />
          </g>
        </g>
        <g ref={h2} className="ln-ci-m-head ln-ci-m-h2" transform={tf(...HEAD2_END)}>
          <g className="ln-ci-m-jwrap">
            <circle className="ln-ci-m-roller" r="7.5" />
            <circle className="ln-ci-m-rdot" r="2.6" />
          </g>
        </g>
      </svg>
    </ConceptFigure>
  );
}
