/**
 * Minimal geometric flags drawn inline — emoji flags don't render on Windows
 * and we ship no flag assets. Each is a decorative backdrop for an i18n
 * progress bar, so they're simplified to their geometry (band ratios kept).
 * Real flag colors stay literal hex by design — they don't theme.
 */

export type FlagKey = "eu" | "jp" | "in" | "ae";

/** 5-point star as an SVG points string (10 vertices). */
function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** Twelve gold stars on a ring — the EU circle. */
const EU_STAR_RING = Array.from({ length: 12 }, (_, i) => {
  const a = (Math.PI / 6) * i - Math.PI / 2;
  return starPoints(30 + 12 * Math.cos(a), 20 + 12 * Math.sin(a), 2.6, 1.04);
});

/** Ashoka-chakra spokes, simplified to 12. */
const CHAKRA_SPOKES = Array.from({ length: 12 }, (_, i) => {
  const a = (Math.PI / 6) * i;
  return {
    x1: +(30 + 1.2 * Math.cos(a)).toFixed(2),
    y1: +(20 + 1.2 * Math.sin(a)).toFixed(2),
    x2: +(30 + 4 * Math.cos(a)).toFixed(2),
    y2: +(20 + 4 * Math.sin(a)).toFixed(2),
  };
});

export default function FlagArt({ flag, className = "" }: { flag: FlagKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      {flag === "eu" && (
        <>
          <rect width="60" height="40" fill="#003399" />
          {EU_STAR_RING.map((points, i) => (
            <polygon key={i} points={points} fill="#ffcc00" />
          ))}
        </>
      )}
      {flag === "jp" && (
        <>
          <rect width="60" height="40" fill="#f5f5f5" />
          <circle cx="30" cy="20" r="9" fill="#bc002d" />
        </>
      )}
      {flag === "in" && (
        <>
          <rect width="60" height="13.4" fill="#ff9933" />
          <rect y="13.3" width="60" height="13.4" fill="#f5f5f5" />
          <rect y="26.6" width="60" height="13.4" fill="#138808" />
          <circle cx="30" cy="20" r="4.4" fill="none" stroke="#000080" strokeWidth="0.9" />
          {CHAKRA_SPOKES.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#000080" strokeWidth="0.5" />
          ))}
        </>
      )}
      {flag === "ae" && (
        <>
          <rect width="60" height="40" fill="#ce1126" />
          <rect x="16" width="44" height="13.4" fill="#00732f" />
          <rect x="16" y="13.3" width="44" height="13.4" fill="#f5f5f5" />
          <rect x="16" y="26.6" width="44" height="13.4" fill="#1a1a1a" />
        </>
      )}
    </svg>
  );
}
