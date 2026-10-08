"use client";

import { useEffect, useState } from "react";
import { BILL_SEGS, BILL_SHAPES, RUN_Y } from "./data";
import { Glyph } from "./Glyphs";
import { useSwap } from "./useSwap";
import type { MobileLandingCopy } from "./useHiveCopy";

interface Props {
  p: MobileLandingCopy["pricing"];
  tag: string;
  on: boolean;
  still: boolean;
}

/** A legend label: a bold name over a small line. */
function Two({ b, s }: { b: string; s: string }) {
  return (
    <>
      <b>{b}</b>
      <span>{s}</span>
    </>
  );
}

/** Stage of the play: 0 = reset (token parked above Personas), 1-3 = the run travels, 4 = done. */
type Stage = 0 | 1 | 2 | 3 | 4;
const STAGE_AT: [Stage, number][] = [[1, 60], [2, 1300], [3, 2700], [4, 4100]];
const RUN_AT: Record<Stage, number> = { 0: RUN_Y.start, 1: RUN_Y.personas, 2: RUN_Y.cli, 3: RUN_Y.anthropic, 4: RUN_Y.anthropic };
const BEAT_AT: Record<Stage, number> = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 };

/**
 * Poster 4: Personas is free. A run leaves your computer through Personas ($0, MIT), passes Claude
 * Code and reaches Anthropic; the only payment line runs from your own Claude plan. Plays each time
 * the poster arrives (or on Replay); reduced motion shows the finished frame.
 */
export default function BillPoster({ p, tag, on, still }: Props) {
  const [stage, setStage] = useState<Stage>(4);
  const [playId, setPlayId] = useState(0);
  const [wasOn, setWasOn] = useState(on);
  if (on !== wasOn) {
    setWasOn(on);
    if (on && !still) {
      setStage(0);
      setPlayId((n) => n + 1);
    }
  }
  const replay = () => {
    if (still) return;
    setStage(0);
    setPlayId((n) => n + 1);
  };

  useEffect(() => {
    if (playId === 0) return;
    const ids = STAGE_AT.map(([s, ms]) => setTimeout(() => setStage(s), ms));
    return () => ids.forEach(clearTimeout);
  }, [playId]);

  const shown: Stage = still ? 4 : stage;
  const [beat, swapping] = useSwap(p.beats[BEAT_AT[shown]], 180, still);
  const legend: [string, number, number, React.ReactNode][] = [
    ["pl fr", 28, 28, p.computer],
    ["pl big", 62, 92, p.zero],
    ["pl", 118, 92, <Two key="p" b={p.personas} s={p.license} />],
    ["pl", 104, 218, <Two key="c" b={p.cli} s={p.cliSub} />],
    ["pl amber", 104, 296, <Two key="a" b={p.anthropic} s={p.claude} />],
    ["pl amber c", 286, 332, <b key="plan" className="plan-l">{p.planLines.map((l, i) => <span key={i}>{l}</span>)}</b>],
    ["pl only", 160, 352, p.onlyBill],
  ];

  return (
    <section className={`poster p4${on ? " on" : ""}`} id="s4" data-poster="" aria-labelledby="hm-h4">
      <div className="bg" aria-hidden="true" />
      <div className="copy">
        <h2 id="hm-h4" className="disp" data-role="m-bill-title">{p.title}</h2>
        <p className="sub">{p.sub}</p>
      </div>
      <div className={`beat disp${swapping ? " sw" : ""}`} aria-live="polite" data-role="m-beat">
        {beat}
      </div>
      <div className="art bill" data-step={shown === 0 ? 1 : shown} role="img" aria-label={p.artLabel} data-role="m-bill" onClick={replay}>
        <svg viewBox="0 0 360 372" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
          <polygon className="frame" points={BILL_SHAPES.frame} />
          {BILL_SEGS.map((s, i) => {
            const lit = shown >= (s.pipe === 140 ? 2 : 3);
            const n = BILL_SEGS.filter((x, j) => x.pipe === s.pipe && j < i).length;
            return <polygon key={i} className={`seg${lit ? " lit" : ""}`} points={s.points} style={lit && !still ? { transitionDelay: `${n * 130 - 50}ms` } : undefined} />;
          })}
          <polygon className="stn e" points={BILL_SHAPES.personas} />
          <polygon className="stn p" points={BILL_SHAPES.cli} />
          <polygon className="stn a" points={BILL_SHAPES.anthropic} />
          <polygon className="plan" points={BILL_SHAPES.plan} />
          <path className="payline" d="M 226 332 H 94" />
          <polygon className="run" points={BILL_SHAPES.run} style={{ transform: `translate(62px,${RUN_AT[shown]}px)`, transition: shown === 0 ? "none" : undefined }} />
        </svg>
        {legend.map(([cls, x, y, body]) => (
          <div key={`${x},${y}`} className={cls} style={{ "--x": x, "--y": y } as React.CSSProperties} aria-hidden="true" data-role={cls === "pl big" ? "m-bill-big" : undefined}>
            {body}
          </div>
        ))}
      </div>
      <div className="below row">
        <button className="ghost" type="button" onClick={replay}>
          <Glyph id="gl-replay" size={20} />
          <span>{p.replay}</span>
        </button>
        <p className="tag">{tag}</p>
      </div>
    </section>
  );
}
