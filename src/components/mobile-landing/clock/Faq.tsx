"use client";

import { useRef, useState } from "react";
import GradientText from "@/components/GradientText";
import { KNOB, KNOB_COLORS } from "./art";
import { fill, type ClockCopy } from "./copy";
import { FAQ_HOUR, hhmm } from "./geometry";
import s from "./clock.module.css";

const N = 4;
const RL = [s.rl0, s.rl1, s.rl2, s.rl3];

/** Chapter 5, 21:00: ask the dial. Turn the knob, tap a label or step with the arrows. */
export function Faq({ c }: { c: ClockCopy }) {
  const [q, setQ] = useState(0);
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ cx: number; cy: number; last: number; angle: number } | null>(null);

  // Turn the shortest way to question i (the knob keeps counting past a full turn).
  function select(i: number) {
    const next = ((i % N) + N) % N;
    let d = (((next - q) % N) + N) % N;
    if (d > 2) d -= N;
    setAngle((a) => a + d * 90);
    setQ(next);
  }

  function onDown(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    drag.current = { cx, cy, last: Math.atan2(e.clientY - cy, e.clientX - cx), angle };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
    setDragging(true);
  }
  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const g = drag.current;
    if (!g) return;
    const a = Math.atan2(e.clientY - g.cy, e.clientX - g.cx);
    let d = a - g.last;
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    g.last = a;
    g.angle += (d * 180) / Math.PI;
    setAngle(g.angle);
  }
  function onUp() {
    const g = drag.current;
    if (!g) return;
    drag.current = null;
    setDragging(false);
    const snap = Math.round(g.angle / 90);
    setAngle(snap * 90);
    setQ(((snap % N) + N) % N);
  }

  const item = c.faq.items[q];
  return (
    <section className={s.flow} data-k="faq" id="faq" aria-labelledby="m2-faq-h">
      <div className={s.clockbig} aria-hidden="true">
        {hhmm(FAQ_HOUR)}
      </div>
      <p className={s.kick}>
        <span className={s.tag}>{c.chrome.stylized}</span> {c.faq.kick}
      </p>
      <h2 className={s.hl} id="m2-faq-h">
        <span className={s.ln}>{c.faq.lines[0]}</span>
        <span className={s.ln}>
          <GradientText>{c.faq.lines[1]}</GradientText>
        </span>
      </h2>
      <div className={s.rotary} data-role="rotary">
        <svg
          className={s.knob}
          viewBox="0 0 300 300"
          focusable="false"
          tabIndex={0}
          role="slider"
          aria-label={c.faq.dialAria}
          aria-valuemin={1}
          aria-valuemax={N}
          aria-valuenow={q + 1}
          aria-valuetext={item.q}
          data-drag={dragging ? "" : undefined}
          style={{ transform: `rotate(${angle}deg)` }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              e.preventDefault();
              select(q + 1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault();
              select(q - 1);
            }
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <circle cx={150} cy={150} r={142} className={s.kring} />
          {KNOB.ticks.map(({ major, ...t }, i) => (
            <line key={i} {...t} className={s.kt} opacity={major ? 1 : 0.55} />
          ))}
          {KNOB.arcs.map((d, i) => (
            <path key={i} d={d} className={s.ka} stroke={KNOB_COLORS[i]} />
          ))}
          <circle cx={150} cy={34} r={9} className={s.kd} />
        </svg>
        <div className={s.needleR} aria-hidden="true" />
        {c.faq.labels.map((label, i) => (
          <button key={i} type="button" className={`${s.rl} ${RL[i]}`} aria-pressed={i === q} onClick={() => select(i)}>
            {label}
          </button>
        ))}
        <div className={s.rc} aria-hidden="true">
          <b>{q + 1}</b>
          <span>{fill(c.faq.of, { n: N })}</span>
        </div>
      </div>
      <div className={s.qa} aria-live="polite">
        <h3 className={`${s.q} ${s.swap}`} key={`q${q}`} data-role="faq-q">
          {item.q}
        </h3>
        <div className={`${s.panel} ${s.swap}`} key={`a${q}`} data-role="faq-panel">
          {item.a.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
      <div className={s.qnav}>
        <button type="button" aria-label={c.faq.prev} onClick={() => select(q - 1)}>
          <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span>{fill(c.faq.count, { i: q + 1, n: N })}</span>
        <button type="button" aria-label={c.faq.next} onClick={() => select(q + 1)}>
          <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
