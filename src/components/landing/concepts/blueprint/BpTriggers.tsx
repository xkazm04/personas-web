"use client";

import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import ConceptFigure from "../ConceptFigure";
import { TRIGGER_KEYS } from "../triggers-data";
import { useConceptFigure, type FigureApi } from "../useConceptFigure";
import { useSequencer, type Step } from "../useSequencer";
import { at, BP_RUN, BpPan } from "./bp-parts";

/** Row centre of switch i in the 640x400 drawing. */
const rowY = (i: number) => 40 + 36.4 * i;
/** The finished frame has the schedule circuit closed. */
const DEFAULT = 1;

/** Sheet A-05: ten switches on one line into the agent. Close one and its circuit wakes it. */
export default function BpTriggers() {
  const { t } = useTranslation();
  const c = t.landingNext.conceptsBlueprint;
  const g = c.triggers;
  const still = useStillMotion();
  const seq = useSequencer();
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [cur, setCur] = useState<number | null>(DEFAULT);
  // `zap` restarts the pulse animation; `go` says the pulse is drawn now (else it is simply lit).
  const [zap, setZap] = useState(0);
  const [go, setGo] = useState(false);
  const [said, setSaid] = useState("");

  const fire = useCallback((i: number, animate: boolean) => {
    setCur(i);
    setGo(animate);
    setZap((z) => z + 1);
  }, []);

  const script = useCallback((api: FigureApi<"run">): Step[] => {
    touched.current = false;
    const steps: Step[] = [300, () => api.add("run"), 1100];
    for (const [i, wait] of [[1, 1600], [3, 1600], [6, 0]] as const) {
      steps.push(() => { if (!touched.current) fire(i, true); }, wait);
    }
    return steps;
  }, [fire]);

  const figure = useConceptFigure<"run">({
    all: BP_RUN,
    script,
    onReset: () => { seq.cancel(); setCur(null); setGo(false); },
  });

  const names = TRIGGER_KEYS.map((k) => g[k]);
  const pick = (i: number) => {
    touched.current = true;
    seq.cancel();
    fire(i, !still);
    setSaid(g.woken.replace("{name}", names[i]));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    const edge = e.key === "Home" ? 0 : e.key === "End" ? names.length - 1 : -1;
    if (!step && edge < 0) return;
    e.preventDefault();
    const at0 = box.current ? Array.from(box.current.querySelectorAll("button")).indexOf(document.activeElement as HTMLButtonElement) : -1;
    const next = edge >= 0 ? edge : (Math.max(at0, 0) + step + names.length) % names.length;
    pick(next);
    box.current?.querySelectorAll("button")[next]?.focus();
  };

  const on = cur !== null;
  const phase = !on ? "off" : go ? "go" : "lit";
  const pulse = cur === null ? "" : `M170 ${rowY(cur)}H352V204H446`;

  return (
    <ConceptFigure
      id="triggers"
      index={g.no}
      title={g.title}
      line={g.line}
      description={g.description}
      stylisedLabel={c.stylised}
      replayLabel={c.replay}
      figure={figure}
      actions={<BpPan text={c.pan} />}
      controls={
        <div ref={box} className="ln-bp-ovl" role="group" aria-label={g.group} onKeyDown={onKey}>
          {names.map((n, i) => (
            <button
              key={TRIGGER_KEYS[i]}
              type="button"
              className="ln-bp-sw"
              style={{ "--ln-y": `${((rowY(i) - 18.2) / 4).toFixed(2)}%` } as CSSProperties}
              aria-label={n}
              aria-pressed={cur === i}
              onClick={() => pick(i)}
            />
          ))}
          <p className="ln-sr" aria-live="polite">{said}</p>
        </div>
      }
    >
      <svg className="ln-bpf" viewBox="0 0 640 400" aria-hidden="true" focusable="false">
        {names.map((n, i) => {
          const y = rowY(i);
          return (
            <g key={TRIGGER_KEYS[i]} className="ln-bp-f" style={at(.05 * i)}>
              <text x="20" y={y + 6}>{n}</text>
              <path className="ln-bp-l" d={`M170 ${y}H222M270 ${y}H352`} />
              <circle className="ln-bp-k" cx="222" cy={y} r="3.6" />
              <circle className="ln-bp-l ln-bp-pp" cx="266" cy={y} r="4" />
              <path
                className={`ln-bp-l ln-bp-l2 ln-bp-blade${cur === i ? " ln-bp-on" : ""}`}
                style={{ transformOrigin: `222px ${y}px` }}
                d={`M222 ${y}H262`}
              />
            </g>
          );
        })}
        <path className="ln-bp-l ln-bp-l3 ln-bp-f" style={at(.2)} d="M352 40V368" />
        <path className="ln-bp-l ln-bp-l2 ln-bp-f" style={at(.3)} d="M352 204H446" />
        {cur !== null && (
          <>
            <path key={`h${zap}`} className={`ln-bp-pulse-h ln-bp-${phase}`} pathLength={1} d={pulse} />
            <path key={`i${zap}`} className={`ln-bp-pulse-i ln-bp-${phase}`} pathLength={1} d={pulse} />
          </>
        )}
        <g className="ln-bp-f" style={at(.4)}>
          <circle className="ln-bp-l ln-bp-l2 ln-bp-pp" cx="500" cy="204" r="54" />
          <use key={`m${zap}`} className={`ln-bp-mk ln-bp-load ln-bp-${phase}`} href="#bp-mk" x="478" y="171" width="44" height="66" />
          <path
            key={`w${zap}`}
            className={`ln-bp-l ln-bp-l2 ln-bp-wake ln-bp-${phase}`}
            d="M500 138V124M500 270V284M434 204H420M566 204H580M453 157L443 147M547 251L557 261M547 157L557 147M453 251L443 261"
          />
        </g>
        <text className="ln-bp-tt ln-bp-f" style={at(.5)} x="500" y="310" textAnchor="middle">{g.agent}</text>
        <text className="ln-bp-tk" x="500" y="336" textAnchor="middle">
          {cur === null ? g.waiting : g.awake.replace("{name}", names[cur])}
        </text>
      </svg>
    </ConceptFigure>
  );
}
