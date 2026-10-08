"use client";

import { useEffect, useRef } from "react";
import { MEMORY_PTS } from "./art";
import { DialFace, type Opener } from "./DialFace";
import { DialFixed } from "./DialFixed";
import type { ClockCopy } from "./copy";
import s from "./clock.module.css";

const POSTER = "/athena/athena_baseline_640.webp";
const LOOP = "/athena/athena_idle_loop.mp4";

interface DialProps {
  c: ClockCopy;
  tool: number;
  dom: number;
  price: number;
  mom: number;
  /** Athena's idle loop may play: her chapter is up, motion is allowed and the tab is visible. */
  athenaLive: boolean;
  onRun: (k: number, ...a: Parameters<Opener>) => void;
  onTool: (k: number) => void;
  onNode: (i: number, ...a: Parameters<Opener>) => void;
}

/** The art layer of the pinned stage: the dial (turned by the engine) and Athena as the moon. */
export function Dial({ c, tool, dom, price, mom, athenaLive, onRun, onTool, onNode }: DialProps) {
  const vid = useRef<HTMLVideoElement>(null);

  // The loop loads only when Athena first rises, and pauses whenever she is not up.
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (!athenaLive) {
      v.pause();
      v.removeAttribute("data-live");
      return;
    }
    if (!v.getAttribute("src")) v.setAttribute("src", LOOP);
    v.play()
      .then(() => v.setAttribute("data-live", ""))
      .catch(() => {
        /* autoplay refused: the still portrait stays */
      });
  }, [athenaLive]);

  return (
    <div className={s.art}>
      <div className={s.dial} data-role="dial">
        <div className={`${s.rimglow} ${s.rimWarm}`} data-k="rimWarm" aria-hidden="true" />
        <div className={`${s.rimglow} ${s.rimCool}`} data-k="rimCool" aria-hidden="true" />
        <div className={s.dialRot} data-k="dialRot" style={{ transform: "rotate(-75deg)" }}>
          <DialFace c={c} tool={tool} dom={dom} onRun={onRun} onTool={onTool} />
        </div>
        <DialFixed c={c} dom={dom} price={price} onNode={onNode} />
      </div>
      <div className={s.athena} data-k="athena" data-m={mom}>
        <div className={s.halo} aria-hidden="true" />
        <div className={s.ripples} aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className={s.disc}>
          {/* eslint-disable-next-line @next/next/no-img-element -- a 640px still inside a CSS-sized disc; next/image adds nothing here */}
          <img src={POSTER} width={640} height={640} alt={c.athena.imgAlt} decoding="async" />
          <video ref={vid} muted loop playsInline preload="none" tabIndex={-1} aria-hidden="true" width={320} height={320} />
        </div>
        <svg className={s.memory} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
          {MEMORY_PTS.map((p, i) => {
            const q = MEMORY_PTS[(i + 1) % MEMORY_PTS.length];
            return <line key={`e${i}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} />;
          })}
          <line x1={58} y1={30} x2={168} y2={44} />
          <line x1={24} y1={70} x2={150} y2={168} />
          {MEMORY_PTS.map((p, i) => (
            <circle key={`n${i}`} cx={p[0]} cy={p[1]} r={i === 2 || i === 6 ? 7 : 4.5} className={i === 4 ? s.keep : undefined} />
          ))}
        </svg>
        <div className={s.bubble} aria-hidden="true">
          {c.athena.bubble}
        </div>
      </div>
    </div>
  );
}
