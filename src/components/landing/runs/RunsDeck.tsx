"use client";

import type { CSSProperties, RefObject } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import LnLed from "../shared/LnLed";
import { LnKeyButton } from "../shared/LnKey";
import { useAmbientLive } from "../shared/useAmbientLive";
import { DAY_LED, FRAMES, LAST, dayState, packs } from "./frames";

interface Props {
  deckRef: RefObject<HTMLDivElement | null>;
  frame: number;
  running: boolean;
  seek: (f: number) => void;
  toggle: () => void;
}

/** The week's timeline: reels, a clock, the five day cards and the play / step / scrub controls. */
export default function RunsDeck({ deckRef, frame, running, seek, toggle }: Props) {
  const { t } = useTranslation();
  const r = t.landingNext.runs;
  const live = useAmbientLive(deckRef);
  const fr = FRAMES[frame];
  const [pl, pr] = packs(frame);
  const clock = `${r.days[fr.day].toUpperCase()} ${fr.time}`;
  const status = r.status[fr.status];
  const cls = ["ln-panel", "ln-tdeck", live && running && "ln-live", running && fr.motion !== "none" && `ln-${fr.motion}`]
    .filter(Boolean)
    .join(" ");
  const playLabel = running ? r.controls.pause : frame >= LAST ? r.controls.replay : r.controls.play;

  return (
    <div className={cls} ref={deckRef}>
      <div className="ln-td-mech" aria-hidden="true">
        <svg className="ln-td-tape" viewBox="0 0 620 250" preserveAspectRatio="none">
          <path className="ln-td-line" d="M60 215 C 150 245, 230 245, 270 222 L 350 222 C 390 245, 470 245, 560 215" fill="none" strokeWidth="5" />
          <circle className="ln-td-post" cx="270" cy="222" r="9" />
          <circle className="ln-td-post" cx="350" cy="222" r="9" />
        </svg>
        <div className="ln-td-reel ln-l">
          <i className="ln-pack" style={{ "--ln-p": `${pl}%` } as CSSProperties} />
          <i className="ln-reel" />
        </div>
        <div className="ln-td-reel ln-r">
          <i className="ln-pack" style={{ "--ln-p": `${pr}%` } as CSSProperties} />
          <i className="ln-reel" />
        </div>
        <div className="ln-td-head">
          <LnLed state={fr.led} className={`ln-${fr.led}`} />
          {r.head}
        </div>
      </div>
      <div className="ln-td-side">
        <div className="ln-lcd ln-td-lcd">
          <div className="ln-lcd-inner" aria-live={running ? "off" : "polite"} aria-atomic="true">
            <div className="ln-td-sched">{r.schedule}</div>
            <div className="ln-td-count ln-lcd-glow">{clock}</div>
            <div className="ln-td-status">{status}</div>
          </div>
        </div>
        <div className="ln-td-ctl">
          <LnKeyButton tone="signal" icon={running ? "i-stop" : "i-play"} onClick={toggle}>
            {playLabel}
          </LnKeyButton>
          <LnKeyButton size="sm" disabled={frame <= 0} onClick={() => seek(frame - 1)}>
            {r.controls.back}
          </LnKeyButton>
          <LnKeyButton size="sm" disabled={frame >= LAST} onClick={() => seek(frame + 1)}>
            {r.controls.next}
          </LnKeyButton>
          <span className="ln-caption">{r.illustration}</span>
        </div>
        <input
          type="range"
          className="ln-td-range"
          min={0}
          max={LAST}
          step={1}
          value={frame}
          aria-label={r.controls.slider}
          aria-valuetext={`${clock}. ${status}`}
          onChange={(e) => seek(Number(e.target.value))}
        />
      </div>
      <ol className="ln-week" aria-label={r.weekLabel}>
        {r.days.map((d, i) => {
          const st = dayState(i, frame);
          return (
            <li key={d} className={fr.day === i && frame > 0 && frame < 10 ? "ln-cur" : undefined}>
              <LnLed state={DAY_LED[st]} className={`ln-${DAY_LED[st]}`} />
              <b>{d.toUpperCase()}</b>
              <span className="ln-w-t">08:00</span>
              <span className="ln-w-st">{r.dayState[st]}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
