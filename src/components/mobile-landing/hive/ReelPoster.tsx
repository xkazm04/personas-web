"use client";

import { useRef } from "react";
import type { Translations } from "@/i18n/en";
import { NEEDS } from "./data";
import { Glyph } from "./Glyphs";
import { TOOL_PATHS, type ToolKey } from "./toolIcons";
import { useReel } from "./useReel";
import { useSwap } from "./useSwap";
import { fill, type MobileLandingCopy } from "./useHiveCopy";

export function ToolCoin({ tool }: { tool: ToolKey }) {
  return (
    <span className={`coin t-${tool}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={TOOL_PATHS[tool]} />
      </svg>
    </span>
  );
}

interface Props {
  u: MobileLandingCopy["useCases"];
  tools: Translations["useCasesSection"];
  tag: string;
  on: boolean;
  live: boolean;
  still: boolean;
  paused: boolean;
  onOpenTool: (tool: ToolKey) => void;
}

/** Poster 2: one persona, many tools - a hex-prism reel lands each job on the right tool. */
export default function ReelPoster({ u, tools, tag, on, live, still, paused, onOpenTool }: Props) {
  const r = useReel(live, still, paused);
  const [needText, swapping] = useSwap(u.needs[r.need], 200, still);
  const n = NEEDS[r.need];
  const toolName = (key: ToolKey) => (key === "drive" ? u.driveShort : tools[key].name);
  const full = tools[n.tool].name;
  const swipe = useRef({ x: 0, y: 0, id: -1, swiped: false });

  const onDown = (e: React.PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId, swiped: false };
    r.touch();
  };
  const onUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    if (s.id !== e.pointerId) return;
    s.id = -1;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      s.swiped = true;
      if (dx < 0) r.next(true);
      else r.prev();
    }
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      r.next(true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      r.prev();
    }
  };

  return (
    <section className={`poster p2${on ? " on" : ""}`} id="s2" data-poster="" aria-labelledby="hm-h2">
      <div className="bg" aria-hidden="true" />
      <div className="copy">
        <h2 id="hm-h2" className="eyebrow" data-role="m-uc-title">{u.title}</h2>
        <p className="lede">{u.lede}</p>
        <p className={`need disp${swapping ? " sw" : ""}`} data-role="m-need">{needText}</p>
      </div>
      <div
        className={`art reel${r.landTick > 0 ? " land" : ""}`}
        role="group"
        aria-roledescription="carousel"
        aria-label={u.reelLabel}
        data-role="m-reel"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (swipe.current.id = -1)}
        onKeyDown={onKey}
      >
        <div className="reel-glow" aria-hidden="true" />
        <div className="drum-wrap" aria-hidden="true">
          <div className={`drum${r.spinning ? " spin" : ""}`} style={{ "--k": r.k } as React.CSSProperties}>
            {r.deck.map((tool, i) => (
              <div key={i} className={r.faceClass(i)} style={{ "--n": i } as React.CSSProperties}>
                <span className="in">
                  <ToolCoin tool={tool} />
                  <span className="fname">{toolName(tool)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <svg key={r.landTick} className="reel-frame" viewBox="0 0 380 200" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <polygon className="rf-in" points="36,3 344,3 377,100 344,197 36,197 3,100" />
          <polygon className="rf-out" points="36,3 344,3 377,100 344,197 36,197 3,100" />
        </svg>
        <div className="reel-shade" aria-hidden="true" />
        <button
          className="reel-hit"
          type="button"
          aria-label={fill(u.openJobs, { tool: full })}
          onClick={() => {
            if (swipe.current.swiped) swipe.current.swiped = false;
            else onOpenTool(n.tool);
          }}
        >
          <span aria-hidden="true">{u.tapHint}</span>
        </button>
        <span className="reel-hint">{tag}</span>
      </div>
      <div className="persona" data-role="m-persona">
        <div className="emblem" aria-hidden="true">
          <svg viewBox="0 0 40 28" width="34" height="24">
            <use href="#hm-g-team" />
          </svg>
        </div>
        <div className="pt">
          <b>{u.personaName}</b>
          <span>{u.personaLine}</span>
        </div>
        <div className={`jobs${r.landTick > 0 ? " bump" : ""}`} aria-live="polite">
          <b key={r.landTick}>{r.connected.length * 3}</b>
          <span>{u.jobsUnit}</span>
        </div>
        <span key={r.landTick} className={`plus${r.landTick > 0 ? " fly" : ""}`} aria-hidden="true">
          + {tools[n.tool].cases[n.job].title}
        </span>
      </div>
      <div className="ctrl">
        <button className="rbtn" type="button" aria-label={u.prev} data-role="m-rbtn" onClick={r.prev}>
          <Glyph id="gl-chev-l" size={24} />
        </button>
        <div className="pips" aria-hidden="true">
          {NEEDS.map((x, i) => (
            <i key={i} className={i === r.need ? "on" : r.connected.includes(x.tool) ? "done" : ""} />
          ))}
        </div>
        <button className="rbtn" type="button" aria-label={u.replay} onClick={r.replay}>
          <Glyph id="gl-replay" size={24} />
        </button>
        <button className="rbtn" type="button" aria-label={u.next} onClick={() => r.next(true)}>
          <Glyph id="gl-chev-r" size={24} />
        </button>
      </div>
      <p className="sr" role="status" aria-live="polite">
        {r.spinning ? "" : fill(u.status, { n: r.need + 1, need: u.needs[r.need], tool: full })}
      </p>
    </section>
  );
}
