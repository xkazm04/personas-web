import type { CSSProperties } from "react";

export interface DrawingCopy {
  artLabel: string;
  fig: string;
  dimDiameter: string;
  dimRadius: string;
  dimStem: string;
  dimAngle: string;
  datum: string;
  datumNote: string;
  redline: string;
}

/** Sets the plot delay (`--ln-d`) and duration (`--ln-t`) a stroke draws with. */
const at = (d: number, t?: number) =>
  ({ "--ln-d": `${d}s`, ...(t ? { "--ln-t": `${t}s` } : {}) }) as CSSProperties;

const QUADRANTS = "M330 250V140A110 110 0 0 1 440 250ZM330 250H220A110 110 0 0 0 330 360Z";
// 28 fixed 45-degree hatch strokes, clipped to the two inked quadrants.
const HATCH = Array.from({ length: 28 }, (_, i) => 470 + i * 8.5);

/**
 * "The datum P": the mark drawn with its construction geometry. Strokes carry
 * `pathLength="1"` so one CSS keyframe plots any of them; the parent's
 * `ln-bpc-run` class starts the plot and its absence leaves the finished
 * drawing (reduced motion, or a settled plot).
 */
export default function BlueprintDrawing({ c }: { c: DrawingCopy }) {
  return (
    <svg className="ln-bpc-svg" viewBox="0 0 680 700" role="img" aria-label={c.artLabel}>
      <defs>
        <clipPath id="ln-bpc-q"><path d={QUADRANTS} /></clipPath>
        <marker id="ln-bpc-ah" viewBox="0 0 10 10" refX="9.6" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
          <path d="M0 1.2L10 5 0 8.8z" fill="var(--ln-rule)" />
        </marker>
      </defs>
      <g aria-hidden="true">
        <path className="ln-bpc-g ln-bpc-f" style={at(0)} d="M110 30V600M165 30V600M220 30V600M275 30V600M330 30V600M385 30V600M440 30V600M495 30V600M550 30V600M110 30H550M110 85H550M110 140H550M110 195H550M110 250H550M110 305H550M110 360H550M110 415H550M110 470H550M110 525H550M110 580H550" />
        <path className="ln-bpc-c ln-bpc-cl ln-bpc-f" style={at(0.12)} d="M36 250H588" />
        <path className="ln-bpc-c ln-bpc-cl ln-bpc-f" style={at(0.2)} d="M330 22V612" />
        <path className="ln-bpc-c ln-bpc-cl ln-bpc-f" style={at(0.3)} d="M220 52V640" />
        <circle className="ln-bpc-c ln-bpc-dsh ln-bpc-f" style={at(0.5)} cx="330" cy="250" r="165" />
        <path className="ln-bpc-c ln-bpc-p" style={at(0.45, 0.9)} pathLength="1" d="M220 140H440V360H220Z" />
        <path className="ln-bpc-c ln-bpc-dsh ln-bpc-f" style={at(0.9)} d="M126 619L316 429" />
        <g clipPath="url(#ln-bpc-q)">
          {HATCH.map((x, i) => (
            <path key={x} className="ln-bpc-hl ln-bpc-p" style={at(1.45 + i * 0.028, 0.32)} pathLength="1" d={`M${x - 360} 360L${x - 140} 140`} />
          ))}
        </g>
        <path className="ln-bpc-q" d={QUADRANTS} />
        <path className="ln-bpc-m ln-bpc-p" style={at(0.7, 1)} pathLength="1" d="M220 250A110 110 0 1 1 440 250A110 110 0 1 1 220 250" />
        <path className="ln-bpc-m ln-bpc-p" style={at(1.35, 0.55)} pathLength="1" d="M220 128V525" />
        <path className="ln-bpc-mt ln-bpc-p" style={at(1.85, 0.28)} pathLength="1" d="M172 573L268 477" />
        <path className="ln-bpc-d ln-bpc-p" style={at(1.9, 0.4)} pathLength="1" d="M220 116V70M440 236V70" />
        <path className="ln-bpc-d ln-bpc-p" style={at(2.05, 0.5)} pathLength="1" markerStart="url(#ln-bpc-ah)" markerEnd="url(#ln-bpc-ah)" d="M221 84H439" />
        <text className="ln-bpc-ink ln-bpc-f" style={at(2.3)} x="330" y="66" textAnchor="middle">{c.dimDiameter}</text>
        <path className="ln-bpc-d ln-bpc-p" style={at(2, 0.45)} pathLength="1" markerEnd="url(#ln-bpc-ah)" d="M330 250L419.5 312.7" />
        <text className="ln-bpc-ink ln-bpc-f" style={at(2.35)} x="430" y="344">{c.dimRadius}</text>
        <path className="ln-bpc-d ln-bpc-p" style={at(1.95, 0.4)} pathLength="1" d="M204 525H112" />
        <path className="ln-bpc-d ln-bpc-p" style={at(2.1, 0.5)} pathLength="1" markerStart="url(#ln-bpc-ah)" markerEnd="url(#ln-bpc-ah)" d="M128 251V524" />
        <text className="ln-bpc-ink ln-bpc-f" style={at(2.35)} transform="translate(102 388) rotate(-90)" textAnchor="middle">{c.dimStem}</text>
        <path className="ln-bpc-d ln-bpc-dsh ln-bpc-f" style={at(2)} d="M232 525H320" />
        <path className="ln-bpc-d ln-bpc-p" style={at(2.15, 0.4)} pathLength="1" d="M290 525A70 70 0 0 0 269.5 475.5" />
        <text className="ln-bpc-ink ln-bpc-f" style={at(2.4)} x="300" y="504">{c.dimAngle}</text>
        <path className="ln-bpc-d ln-bpc-p" style={at(2.2, 0.4)} pathLength="1" d="M446 140L412 186" />
        <circle className="ln-bpc-dot ln-bpc-f" style={at(2.4)} cx="412" cy="186" r="3.6" />
        <text className="ln-bpc-ink ln-bpc-f" style={at(2.4)} x="454" y="124">{c.datum}</text>
        <text className="ln-bpc-f ln-bpc-sm" style={at(2.45)} x="454" y="150">{c.datumNote}</text>
        <path className="ln-bpc-rl ln-bpc-p" style={at(2.5, 0.6)} pathLength="1" d="M300 628c-14-10-2-26 16-22 8-16 30-14 34 0 16-6 30 6 22 20 12 8 4 24-12 22-6 14-30 14-36 2-16 6-30-6-24-22z" />
        <text className="ln-bpc-red ln-bpc-f" style={at(2.7)} x="392" y="640">{c.redline}</text>
        <text className="ln-bpc-f ln-bpc-sm" style={at(0.2)} x="36" y="26">{c.fig}</text>
      </g>
    </svg>
  );
}
