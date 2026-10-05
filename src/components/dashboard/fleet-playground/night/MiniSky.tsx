import { memo } from "react";
import { f1, mulberry32 } from "./palette";

function build() {
  const r = mulberry32(3);
  const stars = Array.from({ length: 26 }, () => ({ x: f1(r() * 230), y: f1(r() * 100), r: f1(0.6 + r() * 0.8), o: f1(0.3 + r() * 0.5) }));
  const blocks: { x: number; w: number; h: number; lights: { x: number; y: number; warm: boolean }[] }[] = [];
  for (let x = -4; x < 234; ) {
    const w = 18 + r() * 26;
    const h = 30 + r() * 60;
    const lights = [0, 1, 2].filter(() => r() < 0.5).map(() => ({ x: f1(x + 4 + r() * (w - 10)), y: f1(170 - h + 8 + r() * (h - 20)), warm: r() < 0.2 }));
    blocks.push({ x: f1(x), w: f1(w), h: f1(h), lights });
    x += w + 3;
  }
  return { stars, blocks };
}
const ART = build();

/** The view from the agent's window: the city at night, the moon filled to the
 *  5-hour meter. Stylised illustration. */
function MiniSky({ used5 }: { used5: number }) {
  return (
    <svg width={230} height={170} viewBox="0 0 230 170" aria-hidden="true" className="block">
      <rect width={230} height={170} style={{ fill: "var(--ns-sky-mid)" }} />
      <g style={{ fill: "var(--ns-star)", opacity: "var(--ns-star-op)" }}>
        {ART.stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />)}
      </g>
      <clipPath id="ns-mini-moon"><circle cx={176} cy={42} r={17} /></clipPath>
      <circle cx={176} cy={42} r={17} style={{ fill: "var(--ns-moon-dark)" }} />
      <rect clipPath="url(#ns-mini-moon)" x={159} y={f1(59 - (34 * used5) / 100)} width={34} height={34} style={{ fill: "var(--ns-moon)" }} />
      {ART.blocks.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={f1(170 - b.h)} width={b.w} height={b.h} style={{ fill: "var(--ns-far)" }} />
          {b.lights.map((l, k) => <rect key={k} x={l.x} y={l.y} width={4} height={5} style={{ fill: l.warm ? "var(--brand-amber)" : "var(--brand-cyan)" }} opacity={0.7} />)}
        </g>
      ))}
      <path d="M 115 0 V 170 M 0 85 H 230" style={{ stroke: "var(--ns-monitor)" }} strokeWidth={6} />
    </svg>
  );
}

export default memo(MiniSky);
