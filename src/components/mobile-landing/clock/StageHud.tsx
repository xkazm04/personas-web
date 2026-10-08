import type { ClockCopy } from "./copy";
import s from "./clock.module.css";

/** The stage's clock (the engine writes its digits) and the "stylized day" tag. */
export function StageHud({ c }: { c: ClockCopy }) {
  return (
    <>
      <div className={s.hud}>
        <div className={s.digits} data-k="digits" aria-hidden="true" data-role="digits">
          05:00
        </div>
      </div>
      <div className={s.hudside} aria-hidden="true" data-role="hudside">
        <span className={s.tag}>{c.chrome.stylized}</span>
        <div className={s.swipehint} data-k="swipeHint">
          <span>{c.chrome.scroll}</span>
          <i />
        </div>
      </div>
    </>
  );
}

/** The persona emblem, defined once and drawn by reference (`#m2-emblem`). */
export function Emblem() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="m2-emblem-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand-purple)" />
          <stop offset="1" stopColor="var(--brand-cyan)" />
        </linearGradient>
        <symbol id="m2-emblem" viewBox="0 0 64 64">
          <rect x="2" y="2" width="60" height="60" rx="19" fill="url(#m2-emblem-g)" />
          <circle cx="32" cy="33" r="9.5" fill="none" stroke="white" strokeWidth="3" />
          <path d="M32 12.5V22 M50 43.5L41.5 38.5 M14 43.5L22.5 38.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="11" r="3.6" fill="white" />
          <circle cx="51.2" cy="44.6" r="3.6" fill="white" />
          <circle cx="12.8" cy="44.6" r="3.6" fill="white" />
        </symbol>
      </defs>
    </svg>
  );
}
