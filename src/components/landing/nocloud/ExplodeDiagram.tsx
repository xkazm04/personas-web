import { useTranslation } from "@/i18n/useTranslation";
import { D, GUIDES, W, Y1, Y2, Y3, isoText, marker, p2, port, pts, quad, slab } from "./explode-geometry";

type Layer = 1 | 2 | 3;

function Marker({ layer, y0 }: { layer: Layer; y0: number }) {
  const m = marker(y0);
  return (
    <g className="ln-x-mark">
      <line x1={m.x1} y1={m.y} x2={m.x2} y2={m.y} />
      <circle cx={m.cx} cy={m.y} r={17} />
      <text x={m.cx} y={m.y + 6} textAnchor="middle">
        {layer}
      </text>
    </g>
  );
}

function Slab({ y0, t }: { y0: number; t: number }) {
  const f = slab(y0, t);
  return (
    <>
      <polygon className="ln-x-left" points={f.left} />
      <polygon className="ln-x-right" points={f.right} />
      <polygon className="ln-x-top" points={f.top} />
    </>
  );
}

/** Top plate: the agent controls, a display and one agent standing in its slot. */
function PlateLayer({ label }: { label: string }) {
  const dc = p2(Y1, 250, 122);
  const c0 = p2(Y1, 40, 50);
  const c1 = p2(Y1, 130, 50);
  return (
    <g className="ln-x-l ln-x-l1">
      <Slab y0={Y1} t={20} />
      <polygon className="ln-x-well" points={quad(Y1, 170, 22, 310, 80)} />
      <text className="ln-x-t ln-x-t-lcd" transform={isoText(Y1, 180, 52)}>{label}</text>
      <polygon className="ln-x-cap" points={quad(Y1, 22, 100, 52, 130)} />
      <polygon className="ln-x-cap" points={quad(Y1, 62, 100, 92, 130)} />
      <polygon className="ln-x-sig" points={quad(Y1, 102, 100, 132, 130)} />
      <ellipse className="ln-x-dial-lo" cx={dc[0]} cy={dc[1]} rx={30} ry={17} />
      <ellipse className="ln-x-dial-hi" cx={dc[0]} cy={dc[1] - 4} rx={24} ry={13} />
      <polygon className="ln-x-grille" points={quad(Y1, 22, 20, 150, 80)} />
      <polygon className="ln-x-cart" points={pts([c0, c1, [c1[0], c1[1] - 92], [c0[0], c0[1] - 92]])} />
      <polygon
        className="ln-x-cart-label"
        points={pts([[c0[0] + 8, c0[1] - 45.4], [c1[0] - 8, c1[1] - 54.6], [c1[0] - 8, c1[1] - 86.6], [c0[0] + 8, c0[1] - 77.4]])}
      />
      <Marker layer={1} y0={Y1} />
    </g>
  );
}

/** Middle board: everything lives here, on your machine, with its keys encrypted. */
function BoardLayer({ l }: { l: { machine: string; runsLocal: string; keys: string; encrypted: string } }) {
  return (
    <g className="ln-x-l ln-x-l2">
      <Slab y0={Y2} t={10} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = p2(Y2, 30 + i * 40, 20);
        const b = p2(Y2, 30 + i * 40, D - 20);
        return <line key={i} className="ln-x-trace" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
      })}
      <polygon className="ln-x-well ln-x-edge-sig" points={quad(Y2, 28, 34, 192, 124)} />
      <text className="ln-x-t ln-x-t-lcd2" transform={isoText(Y2, 40, 66)}>{l.machine}</text>
      <text className="ln-x-t ln-x-t-sig" transform={isoText(Y2, 40, 94)}>{l.runsLocal}</text>
      <polygon className="ln-x-well ln-x-edge-ok" points={quad(Y2, 198, 46, 308, 124)} />
      <text className="ln-x-t ln-x-t-lcd2" transform={isoText(Y2, 207, 78)}>{l.keys}</text>
      <text className="ln-x-t ln-x-t-ok" transform={isoText(Y2, 206, 102)}>{l.encrypted}</text>
      <Marker layer={2} y0={Y2} />
    </g>
  );
}

/** Base: ports on the back panel and a crossed-out antenna, so nothing goes out. */
function BaseLayer({ label }: { label: string }) {
  const ant = p2(Y3, W, 120);
  const ag = p2(Y3, W - 30, D - 30);
  return (
    <g className="ln-x-l ln-x-l3">
      <Slab y0={Y3} t={42} />
      <polygon className="ln-x-inset" points={quad(Y3, 20, 20, W - 20, D - 20)} />
      <text className="ln-x-t ln-x-t-ink" transform={isoText(Y3, 40, 95)}>{label}</text>
      <polygon className="ln-x-port" points={port(Y3, 18, 12, 22, 14)} />
      <polygon className="ln-x-port" points={port(Y3, 52, 12, 14, 14)} />
      <circle className="ln-x-ring" cx={ant[0]} cy={ant[1] + 19} r={8} />
      <path
        className="ln-x-cross"
        d={`M${ant[0] - 12} ${ant[1] + 7}l24 24M${ant[0] + 12} ${ant[1] + 7}l-24 24`}
      />
      <path className="ln-x-ghost" d={`M${ag[0]} ${ag[1]}v-120`} />
      <circle className="ln-x-ghost ln-x-ghost-dot" cx={ag[0]} cy={ag[1] - 124} r={6} />
      <path
        className="ln-x-cross ln-x-cross-lg"
        d={`M${ag[0] - 16} ${ag[1] - 78}l32 32M${ag[0] + 16} ${ag[1] - 78}l-32 32`}
      />
      <Marker layer={3} y0={Y3} />
    </g>
  );
}

/** The exploded view. Decorative art: the figure carries the text equivalent. */
export default function ExplodeDiagram() {
  const { t } = useTranslation();
  const l = t.landingNext.nocloud.layers;
  return (
    <svg viewBox="0 0 760 640" aria-hidden="true" focusable="false">
      {GUIDES.map((g, i) => (
        <line key={i} className="ln-x-guide" {...g} />
      ))}
      <BaseLayer label={l.base} />
      <BoardLayer l={l} />
      <PlateLayer label={l.agents} />
    </svg>
  );
}
