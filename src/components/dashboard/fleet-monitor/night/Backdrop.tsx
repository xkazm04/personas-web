import { memo, useMemo } from "react";
import { f1, mulberry32 } from "./palette";

function build(W: number, ground: number) {
  const r = mulberry32(7);
  const stars = Array.from({ length: Math.round(W / 9) }, () => {
    const big = r() > 0.9;
    return { x: f1(r() * W), y: f1(r() * ground * 0.55), r: f1(big ? 1.2 + r() * 0.5 : 0.5 + r() * 0.6), o: f1(0.18 + r() * 0.45) };
  });
  let hills = `M 0 ${ground}`;
  for (let x = 0; x <= W + 40; x += 40) hills += ` L ${x} ${f1(ground - 90 - Math.sin(x / 260) * 22 - Math.sin(x / 97) * 8)}`;
  hills += ` L ${W + 40} ${ground} Z`;
  let far = "";
  for (let x = -20; x < W; ) {
    const w = 40 + r() * 70;
    const h = 60 + r() * 110;
    far += `M ${f1(x)} ${f1(ground - h)} h ${f1(w)} V ${ground} h ${f1(-w)} Z `;
    x += w + 4 + r() * 22;
  }
  return { stars, hills, far };
}

/** Sky, stars, distant hills, a decorative far row (not data), and the
 *  street, drawn to the field's real size. */
function Backdrop({ W, H, ground }: { W: number; H: number; ground: number }) {
  const art = useMemo(() => build(W, ground), [W, ground]);
  return (
    <g aria-hidden="true" pointerEvents="none">
      <defs>
        <radialGradient id="ns-horizon" cx=".5" cy="1" r=".7">
          <stop offset="0" style={{ stopColor: "var(--ns-horizon)" }} />
          <stop offset="1" style={{ stopColor: "var(--ns-horizon)" }} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={W / 2} cy={ground} rx={W * 0.8} ry={H * 0.4} fill="url(#ns-horizon)" />
      <g style={{ fill: "var(--ns-star)", opacity: "var(--ns-star-op)" }}>
        {art.stars.map((st, i) => <circle key={i} cx={st.x} cy={st.y} r={st.r} opacity={st.o} />)}
      </g>
      <path d={art.hills} style={{ fill: "var(--ns-far2)" }} opacity={0.85} />
      <path d={art.far} style={{ fill: "var(--ns-far)" }} />
      <rect x={0} y={ground} width={W} height={H - ground} style={{ fill: "var(--ns-street)" }} />
      <rect x={0} y={ground} width={W} height={4} style={{ fill: "var(--ns-ground)" }} />
      <path d={`M 0 ${ground + (H - ground) * 0.55} H ${W}`} style={{ stroke: "var(--ns-rail)" }} strokeWidth={2} opacity={0.6} />
      <path d={`M 0 ${ground + (H - ground) * 0.85} H ${W}`} style={{ stroke: "var(--ns-rail)" }} strokeWidth={2} strokeDasharray="26 22" opacity={0.4} />
    </g>
  );
}

export default memo(Backdrop);
