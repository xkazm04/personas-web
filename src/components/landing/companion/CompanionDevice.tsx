"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import LnIcon from "../shared/LnIcon";
import { useAmbientLive } from "../shared/useAmbientLive";
import { useTalk } from "./useTalk";

const isPress = (e: KeyboardEvent) => e.key === " " || e.key === "Enter";

/** The stylised companion: speaker rings, level bars, a reply window and a hold-to-talk button. */
export default function CompanionDevice() {
  const { t } = useTranslation();
  const c = t.landingNext.companion;
  const ref = useRef<HTMLDivElement>(null);
  const live = useAmbientLive(ref);
  const talk = useTalk(c.replies);

  const label = talk.talking ? c.listening : talk.replying ? c.replying : c.standby;
  const reply = talk.talking ? "…" : talk.spoke ? talk.shown : c.hint;

  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    talk.start();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!isPress(e)) return;
    e.preventDefault();
    if (!e.repeat) talk.start();
  };
  const onKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!isPress(e)) return;
    e.preventDefault();
    talk.release();
  };

  return (
    <div
      ref={ref}
      className={`ln-cdev${live ? " ln-live" : ""}${talk.talking ? " ln-talking" : ""}`}
      role="group"
      aria-label={c.deviceLabel}
    >
      <div className="ln-cdev-top">
        <div className="ln-cgrille" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="ln-lcd ln-wave">
          <div className="ln-lcd-inner">
            <small>{c.name}</small>
            <b className="ln-wv-state ln-lcd-glow">{label}</b>
          </div>
          <div className="ln-bars ln-lcd-inner" aria-hidden="true">
            {talk.bars.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="ln-lcd ln-creply">
        <p aria-hidden="true">{reply}</p>
        <p className="ln-sr" aria-live="polite">
          {talk.announce}
        </p>
      </div>
      <button
        type="button"
        className={`ln-ptt${talk.talking ? " ln-down" : ""}`}
        aria-describedby="companion-help"
        onPointerDown={onDown}
        onPointerUp={talk.release}
        onPointerCancel={talk.release}
        onLostPointerCapture={talk.release}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={talk.release}
        onClick={(e) => {
          if (e.detail === 0) talk.tap();
        }}
      >
        <LnIcon id="i-mic" />
        <span>{talk.talking ? c.holdActive : c.hold}</span>
      </button>
      <p className="ln-caption ln-ptt-help" id="companion-help">
        {c.help}
      </p>
    </div>
  );
}
