"use client";

const ACCENT_COLORS: Record<string, { stroke: string; fill: string }> = {
  cyan: { stroke: "#06b6d4", fill: "rgba(6,182,212,0.15)" },
  purple: { stroke: "#a855f7", fill: "rgba(168,85,247,0.15)" },
  emerald: { stroke: "#34d399", fill: "rgba(52,211,153,0.15)" },
  amber: { stroke: "#fbbf24", fill: "rgba(251,191,36,0.15)" },
  rose: { stroke: "#f43f5e", fill: "rgba(244,63,94,0.15)" },
};

export default function Sparkline({
  data,
  width = 64,
  height = 24,
  accent = "cyan",
  strokeWidth = 1.5,
}: {
  data: number[];
  width?: number;
  height?: number;
  accent?: string;
  strokeWidth?: number;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const h = height - pad * 2;
  const w = width - pad * 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const areaPath = `M${points[0]} ${points.map((p) => `L${p}`).join(" ")} L${pad + w},${height} L${pad},${height} Z`;
  const colors = ACCENT_COLORS[accent] ?? ACCENT_COLORS.cyan;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id={`spark-${accent}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.fill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${accent})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={pad + w}
        cy={pad + h - ((data[data.length - 1] - min) / range) * h}
        r={2}
        fill={colors.stroke}
      />
    </svg>
  );
}
