import type { CSSProperties, ReactNode } from "react";

const SEGMENTS = Array.from({ length: 12 }, (_, i) => i);

function Meter({ level }: { level: number }) {
  return (
    <div className="ln-meter">
      {SEGMENTS.map((j) => (
        <i key={j} className={j < level ? "ln-on" : undefined} />
      ))}
    </div>
  );
}

interface Props {
  tape: string;
  tilt?: string;
  status: string;
  level: number;
  fader: number;
  silk: string;
  master?: boolean;
  children?: ReactNode;
}

/** One channel: a taped name label, a status window, meter and fader, a printed caption. */
export default function TeamStrip({ tape, tilt, status, level, fader, silk, master, children }: Props) {
  return (
    <div className={`ln-strip${master ? " ln-master" : ""}`}>
      <div className="ln-tape" style={tilt ? ({ "--ln-t": tilt } as CSSProperties) : undefined}>
        {tape}
      </div>
      <div className="ln-lcd ln-st-lcd">
        <span aria-live={master ? "polite" : undefined}>{status}</span>
      </div>
      <div className="ln-strip-body" aria-hidden="true">
        <Meter level={level} />
        <div className="ln-fader">
          <i style={{ "--ln-v": fader } as CSSProperties} />
        </div>
        {master ? <Meter level={level} /> : null}
      </div>
      {children}
      <span className="ln-silk">{silk}</span>
    </div>
  );
}
