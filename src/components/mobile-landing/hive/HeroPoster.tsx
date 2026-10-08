"use client";

import { useEffect, useRef } from "react";
import { HIVE_CELLS, HUB_PLATE } from "./data";
import { Glyph } from "./Glyphs";
import { useHeroBeat } from "./useHeroBeat";
import type { MobileLandingCopy } from "./useHiveCopy";

interface Props {
  h: MobileLandingCopy["hero"];
  tag: string;
  on: boolean;
  live: boolean;
  still: boolean;
}

/** Poster 1: "One event in. A whole team on it." over a hive of agent cells that answers a tap. */
export default function HeroPoster({ h, tag, on, live, still }: Props) {
  const hiveRef = useRef<HTMLDivElement>(null);
  const { idx, pick, skip } = useHeroBeat(hiveRef, h.events, live, still);

  // The art and its type share one unit (--hu) from the hive box, as in the winner.
  useEffect(() => {
    const hive = hiveRef.current;
    if (!hive || !("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(() => {
      const r = hive.getBoundingClientRect();
      const sc = Math.min(r.width / 390, r.height / 310);
      if (sc > 0) hive.style.setProperty("--hu", `${sc.toFixed(3)}px`);
    });
    ro.observe(hive);
    return () => ro.disconnect();
  }, []);

  // Cells glow under a finger dragged across the hive.
  const glowing = useRef<Element[]>([]);
  const touchGlow = (e: React.PointerEvent) => {
    if (still) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el?.closest(".cell");
    if (!cell || cell.classList.contains("tg")) return;
    cell.classList.add("tg");
    glowing.current.push(cell);
    if (glowing.current.length > 6) glowing.current.shift()?.classList.remove("tg");
    setTimeout(() => {
      cell.classList.remove("tg");
      glowing.current = glowing.current.filter((c) => c !== cell);
    }, 320);
  };

  return (
    <section className={`poster p1${on ? " on" : ""}`} id="s1" data-poster="" aria-labelledby="hm-h1" data-role="m-poster-hero" onPointerDown={skip}>
      <div className="bg" aria-hidden="true">
        <i className="bk b1" />
        <i className="bk b2" />
        <i className="bk b3" />
      </div>
      <div className="copy">
        <p className="kicker" data-role="m-kicker">{h.kicker}</p>
        <h1 id="hm-h1" className="disp" data-role="m-headline">
          <span className="ln l1">{h.line1}</span>{" "}
          <span className="ln l2">
            <span>{h.line2a}</span> <span>{h.line2b}</span>
          </span>
        </h1>
        <p className="sub" data-role="m-hero-sub">{h.sub}</p>
      </div>
      <div className="art hive" ref={hiveRef} role="img" aria-label={h.artLabel} data-role="m-hive" onPointerDown={touchGlow} onPointerMove={touchGlow}>
        <svg viewBox="0 0 390 310" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
          <g>
            {HIVE_CELLS.map((c, i) => (
              <g key={i} className={c.slot >= 0 ? "cell slot" : "cell"} data-slot={c.slot} style={{ "--d": c.d } as React.CSSProperties}>
                <polygon points={c.points} style={{ "--o": c.o } as React.CSSProperties} />
                {c.slot >= 0 && <use href="#hm-g-head" x={c.x - 12} y={c.y - 12} width={24} height={24} className="gh" />}
              </g>
            ))}
          </g>
          <polygon className="hub-plate" points={HUB_PLATE} />
        </svg>
        <div className="gem" aria-hidden="true">
          <span>{h.events[idx].ev}</span>
        </div>
        <div className="tok" aria-hidden="true">
          <Glyph id="gl-check" size={18} />
          <span>{h.events[idx].done}</span>
        </div>
        <div className="hub" aria-hidden="true">
          <span />
        </div>
      </div>
      <div className="below">
        <div className="evchips" role="group" aria-label={h.pickLabel}>
          {h.events.map((e, i) => (
            <button key={e.ev} className="evchip" type="button" aria-pressed={i === idx} data-role="m-evchip" onClick={() => pick(i)}>
              <i />
              <span>{e.ev}</span>
            </button>
          ))}
        </div>
        <p className="trust" data-role="m-trust">{h.trust}</p>
        <p className="tag">{tag}</p>
      </div>
    </section>
  );
}
