"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CAP_KEYS, type CapKey } from "./data";
import { Glyph } from "./Glyphs";
import type { MobileLandingCopy } from "./useHiveCopy";

interface Props {
  a: MobileLandingCopy["athena"];
  on: boolean;
  live: boolean;
  still: boolean;
}

const SAT_GLYPH: Record<CapKey, string> = { always: "gl-power", voice: "gl-mic", memory: "gl-mem", proactive: "gl-ping" };
const SAT_CLASS: Record<CapKey, string> = { always: "sat up s-always", voice: "sat up s-voice", memory: "sat s-memory", proactive: "sat s-proactive" };
const HEX = "52,23 39,45.5 13,45.5 0,23 13,0.5 39,0.5";

/**
 * Poster 3: Athena in a lit lens, four capability satellites around her. A satellite swaps the
 * headline for that capability and she answers in a bubble; holding the portrait is "hold to talk"
 * (a demo: no microphone is used). Cycles the capabilities on its own until touched.
 */
export default function AthenaPoster({ a, on, live, still }: Props) {
  const [cap, setCap] = useState<CapKey | null>(null);
  const [holding, setHolding] = useState(false);
  const [touched, setTouched] = useState(false);
  const [autoIdx, setAutoIdx] = useState(-1);
  const [once, setOnce] = useState(0);
  const [ready, setReady] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  const select = (key: CapKey | null) => {
    setCap(key);
    if (key && key !== "memory" && !still) setOnce((n) => n + 1);
  };

  useEffect(() => {
    if (!live || touched) return;
    const id = setTimeout(
      () => {
        const nx = autoIdx + 1;
        if (nx >= CAP_KEYS.length) {
          setAutoIdx(-1);
          select(null);
        } else {
          setAutoIdx(nx);
          select(CAP_KEYS[nx]);
        }
      },
      autoIdx < 0 ? 2600 : 4200,
    );
    return () => clearTimeout(id);
    // select only reads `still`, which `live` already folds in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, touched, autoIdx]);

  // The idle loop plays only while she is on screen and motion is welcome.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    try {
      if (live) v.play()?.catch(() => {});
      else v.pause();
    } catch {
      /* no codec: the still shows */
    }
  }, [live]);

  const pulseOff = once > 0;
  useEffect(() => {
    if (!pulseOff) return;
    const id = setTimeout(() => setOnce(0), 2400);
    return () => clearTimeout(id);
  }, [once, pulseOff]);

  const hold = (v: boolean) => {
    if (v) setTouched(true);
    setHolding(v);
  };
  const holdShown = holding && on;
  const bubble = holdShown ? a.caps.voice.line : cap ? a.caps[cap].line : "";

  return (
    <section className={`poster p3${on ? " on" : ""}${cap ? " cap" : ""}`} id="s3" data-poster="" aria-labelledby="hm-h3">
      <div className="bg" aria-hidden="true" />
      <div className="copy stack">
        <div className="t-def">
          <h2 id="hm-h3" className="disp" data-role="m-athena-title">{a.title}</h2>
          <p className="sub">{a.sub}</p>
        </div>
        <div className="t-cap" aria-hidden={cap ? undefined : true}>
          <p className="disp">{cap ? a.caps[cap].label : ""}</p>
          <p className="sub">{cap ? a.caps[cap].blurb : ""}</p>
        </div>
      </div>
      <div className={`art astage${cap === "memory" ? " mem" : ""}${holdShown ? " pulsing" : ""}${once > 0 ? " once" : ""}`}>
        <svg className="a-rings" viewBox="-150 -150 300 300" aria-hidden="true" focusable="false">
          <polygon className="hexring" points="136,0 68,117.8 -68,117.8 -136,0 -68,-117.8 68,-117.8" />
          <circle className="ring r1" r="108" />
          <circle className="ring r2" r="124" />
          {/* keyed so each new capability restarts the one-shot pulse */}
          <g key={once}>
            <circle className="pulse p1" r="104" />
            <circle className="pulse p2" r="104" />
            <circle className="pulse p3" r="104" />
          </g>
        </svg>
        <div className="motes" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <button
          className={`lens${holdShown ? " hold" : ""}`}
          type="button"
          aria-label={a.lensLabel}
          data-role="m-lens"
          onPointerDown={(e) => {
            hold(true);
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* capture is a nicety */
            }
          }}
          onPointerUp={() => hold(false)}
          onPointerCancel={() => hold(false)}
          onLostPointerCapture={() => hold(false)}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !e.repeat) {
              e.preventDefault();
              hold(true);
            }
          }}
          onKeyUp={(e) => (e.key === " " || e.key === "Enter") && hold(false)}
          onBlur={() => hold(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Image src="/athena/athena_baseline_640.webp" alt={a.portraitAlt} width={320} height={320} sizes="240px" draggable={false} />
          <video ref={video} className={ready ? "ready" : undefined} muted loop playsInline preload="none" poster="/athena/athena_baseline_640.webp" aria-hidden="true" tabIndex={-1} onPlaying={() => setReady(true)} onError={() => setReady(false)}>
            <source src="/athena/athena_idle_loop.mp4" type="video/mp4" />
          </video>
        </button>
        <div className={`bubble${bubble ? " show" : ""}`} role="status" aria-live="polite">
          {bubble}
        </div>
        {CAP_KEYS.map((key) => (
          <button
            key={key}
            className={SAT_CLASS[key]}
            type="button"
            aria-pressed={cap === key}
            data-role="m-sat"
            onClick={() => {
              setTouched(true);
              select(cap === key ? null : key);
            }}
          >
            <svg className="hx" viewBox="0 0 52 46" aria-hidden="true">
              <polygon points={HEX} />
            </svg>
            <Glyph id={SAT_GLYPH[key]} size={22} className="gi" />
            <span>{a.caps[key].label}</span>
          </button>
        ))}
      </div>
      <div className="below">
        <p className="note">{a.note}</p>
      </div>
    </section>
  );
}
