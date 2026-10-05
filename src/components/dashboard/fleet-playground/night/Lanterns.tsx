import { LABEL, TAG_H, type Halo, type Lantern } from "./lantern-placement";
import s from "./night.module.css";

/** Gradients for the beams, one per reason colour. Lives in the city's <defs>. */
export function BeamDefs({ lanterns }: { lanterns: Lantern[] }) {
  const seen = new Map<string, string>();
  for (const l of lanterns) seen.set(l.key, l.color);
  return (
    <>
      {[...seen].map(([key, color]) => (
        <linearGradient key={key} id={`ns-beam-${key}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" style={{ stopColor: color }} stopOpacity={0.34} />
          <stop offset=".55" style={{ stopColor: color }} stopOpacity={0.12} />
          <stop offset="1" style={{ stopColor: color }} stopOpacity={0.04} />
        </linearGradient>
      ))}
    </>
  );
}

/**
 * A beam of light from each window that needs you up to its lantern tag; a tag
 * that borrowed a neighbouring column is reached by a short leader. Agents with
 * no room for a tag keep a glow on their window.
 */
export function Beams({ lanterns, halos }: { lanterns: Lantern[]; halos: Halo[] }) {
  return (
    <g pointerEvents="none">
      {lanterns.map(({ a, wv, x, y, w, color, key }) => {
        const bx = wv.x + wv.w / 2;
        const tx = Math.min(Math.max(bx, x + 10), x + w - 10);
        const top = y + TAG_H;
        const knee = Math.min(wv.y - 6, top + (tx === bx ? 0 : 18));
        return (
          <g key={a.id}>
            <rect x={bx - 9} y={knee} width={18} height={Math.max(0, wv.y - knee)} fill={`url(#ns-beam-${key})`} />
            <path d={`M ${tx} ${top} L ${bx} ${knee} L ${bx} ${wv.y - 3}`} fill="none" style={{ stroke: color }} strokeWidth={1.5} opacity={0.9} />
            <circle cx={tx} cy={top} r={2.5} style={{ fill: color }} />
            <circle cx={bx} cy={wv.y + wv.h / 2} r={wv.w * 1.15} style={{ fill: color }} opacity={0.14} />
          </g>
        );
      })}
      {halos.map(({ id, wv, color }) => (
        <circle key={id} cx={wv.x + wv.w / 2} cy={wv.y + wv.h / 2} r={wv.w * 1.25} style={{ fill: color }} opacity={0.2} />
      ))}
    </g>
  );
}

interface TagsProps {
  lanterns: Lantern[];
  still: boolean;
  onHover: (id: string | null) => void;
  onOpen: (id: string) => void;
}

/** The lantern tags in the sky: callsign and reason (or callsign alone when
 *  the sky is crowded). Pointer shortcuts to the window below; keyboard users
 *  reach the same agent through the window itself. */
export function Tags({ lanterns, still, onHover, onOpen }: TagsProps) {
  return (
    <div aria-hidden="true" className="absolute inset-0" style={{ pointerEvents: "none" }}>
      {lanterns.map(({ a, x, y, w, compact, text, color }, k) => (
        <div
          key={a.id}
          title={compact ? text : undefined}
          className={`${s.tag} ${still ? "" : s.tagIn}`}
          style={{ left: x, top: y, width: w, ["--c" as string]: color, animationDelay: `${380 + k * 25}ms`, pointerEvents: "auto" }}
          onMouseEnter={() => onHover(a.id)}
          onMouseLeave={() => onHover(null)}
          onClick={() => onOpen(a.id)}
        >
          <span className={s.lantern} />
          <span className="font-mono font-bold text-foreground" style={{ fontSize: LABEL }}>{a.callsign}</span>
          {!compact && <span className="truncate text-muted-dark" style={{ fontSize: LABEL }}>{text}</span>}
        </div>
      ))}
    </div>
  );
}
