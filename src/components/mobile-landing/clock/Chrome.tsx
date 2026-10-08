import { CalendarPlus, Monitor } from "lucide-react";
import PrimaryCTA from "@/components/PrimaryCTA";
import type { ClockCopy } from "./copy";
import s from "./clock.module.css";

interface TopProps {
  c: ClockCopy;
  ci: number;
  flow: boolean;
  inert: boolean;
  onHome: () => void;
}

/** The day's chip: which chapter you are in, and a tap back to the start of the day. */
export function Top({ c, ci, flow, inert, onHome }: TopProps) {
  return (
    <header className={s.top} data-flow={flow ? "" : undefined} inert={inert}>
      <button type="button" className={s.chip} aria-label={c.chrome.chipAria} onClick={onHome} data-role="chip">
        <i className={s.dot} aria-hidden="true" />
        <span>{c.chrome.chapters[ci]}</span>
      </button>
    </header>
  );
}

interface RailProps {
  c: ClockCopy;
  ci: number;
  inert: boolean;
  onGo: (i: number) => void;
}

/** The chapter rail on the right edge. */
export function Rail({ c, ci, inert, onGo }: RailProps) {
  return (
    <nav className={s.rail} data-role="rail" aria-label={c.chrome.railLabel} inert={inert}>
      {c.chrome.rail.map((label, n) => (
        <button key={n} type="button" aria-label={label} aria-current={n === ci ? "true" : undefined} onClick={() => onGo(n)}>
          <i />
        </button>
      ))}
    </nav>
  );
}

interface BarProps {
  c: ClockCopy;
  atCta: boolean;
  inert: boolean;
  onGo: () => void;
  onRemind: () => void;
}

/** The persistent call to action: the web's PrimaryCTA, always on screen. */
export function Bar({ c, atCta, inert, onGo, onRemind }: BarProps) {
  return (
    <div className={s.bar} inert={inert} data-role="bar">
      <PrimaryCTA
        icon={atCta ? CalendarPlus : Monitor}
        label={atCta ? c.chrome.pillRemind : c.chrome.pillGo}
        variant="solid"
        onClick={atCta ? onRemind : onGo}
      />
    </div>
  );
}

/** A short status line above the bar. */
export function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div className={s.toast} role="status" aria-live="polite" data-show={show ? "" : undefined}>
      {msg}
    </div>
  );
}
