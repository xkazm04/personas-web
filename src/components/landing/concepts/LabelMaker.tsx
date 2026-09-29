"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "./ConceptFigure";
import { useConceptFigure } from "./useConceptFigure";
import type { Step } from "./useSequencer";

const STATES = ["feed", "cart", "drop", "flood", "run"] as const;
type S = (typeof STATES)[number];

const KEY_X = [22, 41, 60, 79, 98];
const PRINT = KEY_X.length; // index of the print key in the `down` state
const CHAR_MS = 58;

/** C1: the sentence is typed on the maker's screen, printed, fed into a cartridge that fills with colour. */
export default function LabelMaker() {
  const { t } = useTranslation();
  const c = t.landingNext.concepts;
  const txt = c.label.typed;
  const [count, setCount] = useState(txt.length);
  const [lamp, setLamp] = useState(true);
  const [down, setDown] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const press = useCallback((k: number, ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    setDown(k);
    timer.current = setTimeout(() => setDown(null), ms);
  }, []);

  const script = useCallback(
    (api: { add: (s: S) => void }): Step[] => {
      let n = 0;
      let acc = 0;
      return [
        450,
        {
          t: (dt) => {
            acc += dt;
            while (acc >= CHAR_MS && n < txt.length) {
              acc -= CHAR_MS;
              n += 1;
              setCount(n);
              if (txt.charAt(n - 1) !== " ") press(n % KEY_X.length, 80);
            }
            return n >= txt.length;
          },
        },
        420,
        () => press(PRINT, 260),
        200,
        () => api.add("feed"),
        500,
        () => api.add("cart"),
        900,
        () => api.add("drop"),
        800,
        () => api.add("flood"),
        900,
        () => {
          api.add("run");
          setLamp(true);
        },
      ];
    },
    [txt, press],
  );

  const figure = useConceptFigure<S>({
    all: STATES,
    script,
    onReset: () => {
      setCount(0);
      setLamp(false);
      setDown(null);
    },
    onFinish: () => {
      setCount(txt.length);
      setLamp(true);
      setDown(null);
    },
  });

  const key = (x: number, w: number, on: boolean, cls: string) => (
    <g className={`${cls}${on ? " ln-ci-dn" : ""}`}>
      <rect className="ln-ci-cap-lip" x={x} y="62" width={w} height="16" rx="4" />
      <rect className="ln-ci-cap-face" x={x} y="59" width={w} height="15" rx="4" />
    </g>
  );

  return (
    <ConceptFigure
      id="label"
      index="C1"
      title={c.label.title}
      line={c.label.line}
      description={c.label.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
    >
      <svg className="ln-ci-svg" viewBox="0 0 320 240" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="ci-l-lcdclip"><rect x="26" y="22" width="136" height="29" /></clipPath>
          <clipPath id="ci-l-tapeclip"><rect x="175.5" y="-40" width="180" height="320" /></clipPath>
        </defs>
        <g className="ln-ci-l-cart">
          <ellipse className="ln-ci-shadow" cx="198" cy="229" rx="90" ry="6.5" />
          <rect className="ln-ci-lip" x="118" y="121" width="160" height="106" rx="14" />
          <rect className="ln-ci-l-blank" x="118" y="118" width="160" height="106" rx="14" />
          <rect className="ln-ci-l-flood" x="118" y="118" width="160" height="106" rx="14" />
          <rect className="ln-ci-sheen" x="118" y="118" width="160" height="106" rx="14" />
          <path className="ln-ci-edge-hl" d="M132 119.4h132" />
          <path className="ln-ci-grip" d="M176 123v5.5M181 123v5.5M186 123v5.5M191 123v5.5M196 123v5.5M201 123v5.5M206 123v5.5M211 123v5.5M216 123v5.5" />
          <rect className="ln-ci-win" x="134" y="133" width="128" height="37" rx="10" />
          <circle className="ln-ci-pack" cx="166" cy="151.5" r="15.5" />
          <circle className="ln-ci-pack" cx="230" cy="151.5" r="11.5" />
          <use href="#ci-s-hub" className="ln-ci-reel" x="156" y="141.5" width="20" height="20" style={{ transformOrigin: "166px 151.5px" }} />
          <use href="#ci-s-hub" className="ln-ci-reel" x="220" y="141.5" width="20" height="20" style={{ transformOrigin: "230px 151.5px" }} />
          <path className="ln-ci-glass" d="M148 133h32l-20 37h-22z" />
          <rect className="ln-ci-l-recess" x="128" y="175" width="140" height="38" rx="5" />
          <use href="#ci-s-screw" x="121.5" y="211.5" width="9" height="9" />
          <use href="#ci-s-screw" x="265.5" y="211.5" width="9" height="9" />
          <g className={`ln-ci-led${lamp ? " ln-ci-led--ok" : ""}`}>
            <circle className="ln-ci-led-well" cx="252" cy="125.8" r="4.2" />
            <circle className="ln-ci-led-lens" cx="252" cy="125.8" r="2.7" />
          </g>
        </g>
        <ellipse className="ln-ci-shadow" cx="96" cy="103" rx="90" ry="7.5" />
        <g className="ln-ci-l-maker">
          <rect className="ln-ci-lip" x="12" y="15" width="164" height="88" rx="16" />
          <rect className="ln-ci-body" x="12" y="11" width="164" height="88" rx="16" />
          <path className="ln-ci-edge-hl" d="M28 12.4h132" />
          <rect className="ln-ci-bezel" x="21" y="19" width="146" height="35" rx="7" />
          <rect className="ln-ci-lcd" x="24" y="22" width="140" height="29" rx="4.5" />
          <g clipPath="url(#ci-l-lcdclip)">
            <text className="ln-ci-lcdt" x="150" y="41.5" textAnchor="end" style={{ fontSize: 13 }}>{txt.slice(0, count)}</text>
          </g>
          <rect className="ln-ci-l-cursor" x="152" y="30.5" width="6.5" height="13" rx="1" />
          <rect className="ln-ci-scan" x="24" y="22" width="140" height="29" rx="4.5" />
          {KEY_X.map((x, i) => <g key={x}>{key(x, 16, down === i, "ln-ci-l-key")}</g>)}
          {key(121, 44, down === PRINT, "ln-ci-l-print")}
          <text className="ln-ci-silk" x="22" y="92.5">{c.label.silkMaker}</text>
          <text className="ln-ci-silk" x="143" y="92.5" textAnchor="middle">{c.label.silkPrint}</text>
          <rect className="ln-ci-slot" x="169" y="23" width="7" height="36" rx="2.5" />
        </g>
        <g className="ln-ci-l-drop">
          <g clipPath="url(#ci-l-tapeclip)">
            <g className="ln-ci-l-feed">
              <rect className="ln-ci-l-tape" x="176" y="26" width="128" height="30" rx="1.5" />
              <text className="ln-ci-hand" x="183" y="38.5">{c.label.tapeA}</text>
              <text className="ln-ci-hand" x="183" y="51.5">{c.label.tapeB}</text>
            </g>
          </g>
        </g>
      </svg>
    </ConceptFigure>
  );
}
