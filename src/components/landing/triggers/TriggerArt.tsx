import type { CSSProperties } from "react";
import LnIcon from "../shared/LnIcon";

export interface ArtLabels {
  run: string;
  idle: string;
  changed: string;
}

/** Ten hardware-shaped controls, one per trigger type, in the order of the copy. */
export default function TriggerArt({ index, angle, labels }: { index: number; angle: number; labels: ArtLabels }) {
  switch (index) {
    case 0:
      return <div className="ln-c-key">{labels.run}</div>;
    case 1:
      return (
        <div className="ln-c-clock">
          <i className="ln-hh" />
          <i className="ln-mh" />
          <b />
          <small>08:00</small>
        </div>
      );
    case 2:
      return (
        <>
          <div className="ln-knob-scale" />
          <div className="ln-c-knob" style={{ "--ln-a": `${angle}deg` } as CSSProperties} />
        </>
      );
    case 3:
      return (
        <div className="ln-c-jack">
          <i className="ln-sock" />
          <svg className="ln-plug" viewBox="0 0 120 90">
            <path className="ln-cord" d="M-40 80 C 10 80, 20 45, 52 45" />
            <rect className="ln-tip" x="50" y="36" width="22" height="18" rx="3" />
            <rect className="ln-pin" x="72" y="41" width="14" height="8" />
          </svg>
        </div>
      );
    case 4:
      return (
        <div className="ln-c-toggle">
          <i />
        </div>
      );
    case 5:
      return (
        <div className="ln-c-slider">
          <i />
          <small>
            <span>{labels.idle}</span>
            <span>{labels.changed}</span>
          </small>
        </div>
      );
    case 6:
      return (
        <div className="ln-c-clip">
          <LnIcon id="i-clip" />
        </div>
      );
    case 7:
      return (
        <div className="ln-c-joy">
          <i />
        </div>
      );
    case 8:
      return (
        <div className="ln-c-chain">
          <i className="ln-j ln-a" />
          <i className="ln-j ln-b" />
          <svg viewBox="0 0 124 80">
            <path className="ln-arc" d="M20 62 C 30 0, 94 0, 104 62" />
            <path className="ln-pulse" d="M20 62 C 30 0, 94 0, 104 62" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="ln-c-chord">
          <i>A</i>
          <i>B</i>
          <i>C</i>
        </div>
      );
  }
}
