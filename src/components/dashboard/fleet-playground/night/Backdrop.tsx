import { memo } from "react";
import { f1, mulberry32 } from "./palette";
import { DH, DW, GROUND } from "./city-layout";
import s from "./night.module.css";

/* Drawn far wider and taller than the stage so the letterbox around a scaled
   stage keeps showing sky and street, never a band of page background. */
const X0 = -1600;
const X1 = DW + 1600;

function build() {
  const r = mulberry32(7);
  const stars = Array.from({ length: 210 }, () => {
    const x = X0 + 600 + r() * (X1 - X0 - 1200);
    const y = -300 + r() * 720;
    const rad = r() < 0.9 ? 0.6 + r() * 0.7 : 1.3 + r() * 0.5;
    return { x: f1(x), y: f1(y), r: f1(rad), o: f1(0.18 + r() * 0.45) };
  });
  let hills = `M ${X0} ${GROUND}`;
  for (let x = X0; x <= X1; x += 40) hills += ` L ${x} ${f1(GROUND - 120 - Math.sin(x / 260) * 26 - Math.sin(x / 97) * 10)}`;
  hills += ` L ${X1} ${GROUND} Z`;
  let far = "";
  for (let x = X0; x < X1; ) {
    const w = 50 + r() * 90;
    const h = 70 + r() * 150;
    const kind = r();
    far += `M ${f1(x)} ${f1(GROUND - h)} h ${f1(w)} V ${GROUND} h ${f1(-w)} Z `;
    if (kind < 0.18) far += `M ${f1(x + w / 2 - 1.5)} ${f1(GROUND - h - 40)} h 3 v 40 h -3 Z `;
    else if (kind < 0.32) far += `M ${f1(x - 4)} ${f1(GROUND - h)} L ${f1(x + w / 2)} ${f1(GROUND - h - 26)} L ${f1(x + w + 4)} ${f1(GROUND - h)} Z `;
    x += w + 4 + r() * 26;
  }
  return { stars, hills, far };
}

const ART = build();

/** Sky, stars, distant hills, a decorative far row (not data), and the street. */
function Backdrop() {
  return (
    <svg className={`${s.overflowSvg} ${s.inert}`} width={DW} height={DH} viewBox={`0 0 ${DW} ${DH}`} aria-hidden="true">
      <defs>
        <radialGradient id="ns-horizon" cx=".5" cy="1" r=".7">
          <stop offset="0" style={{ stopColor: "var(--ns-horizon)" }} />
          <stop offset="1" style={{ stopColor: "var(--ns-horizon)" }} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={X0} y={-900} width={X1 - X0} height={GROUND + 900} style={{ fill: "transparent" }} />
      <ellipse cx={DW / 2} cy={GROUND} rx={1400} ry={300} fill="url(#ns-horizon)" />
      <g style={{ fill: "var(--ns-star)", opacity: "var(--ns-star-op)" }}>
        {ART.stars.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r} opacity={st.o} />
        ))}
      </g>
      <path d={ART.hills} style={{ fill: "var(--ns-far2)" }} opacity={0.85} />
      <path d={ART.far} style={{ fill: "var(--ns-far)" }} />
      <rect x={X0} y={GROUND} width={X1 - X0} height={12} style={{ fill: "var(--ns-ground)" }} />
      <rect x={X0} y={GROUND + 12} width={X1 - X0} height={1200} style={{ fill: "var(--ns-street)" }} />
      <rect x={X0} y={GROUND + 12} width={X1 - X0} height={2} style={{ fill: "var(--ns-rail)" }} opacity={0.7} />
      <path d={`M ${X0} ${GROUND + 18} L ${X1} ${GROUND + 18}`} style={{ stroke: "var(--ns-rail)" }} strokeWidth={1.2} opacity={0.8} />
      <path d={`M ${X0} ${GROUND + 52} L ${X1} ${GROUND + 52}`} style={{ stroke: "var(--ns-rail)" }} strokeWidth={2} opacity={0.6} />
      <path d={`M ${X0} ${GROUND + 88} L ${X1} ${GROUND + 88}`} style={{ stroke: "var(--ns-rail)" }} strokeWidth={2} strokeDasharray="26 22" opacity={0.4} />
    </svg>
  );
}

export default memo(Backdrop);
