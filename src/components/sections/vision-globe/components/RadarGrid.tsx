"use client";

interface Props {
  size: number;
  radius: number;
  ringCount: number;
}

export default function RadarGrid({ size, radius, ringCount }: Props) {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 w-full h-full" aria-hidden>
      {Array.from({ length: ringCount }).map((_, i) => {
        const r = ((i + 1) / ringCount) * (radius - 10);
        return (
          <circle key={i} cx={radius} cy={radius} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        );
      })}
      <line x1={radius} y1={8} x2={radius} y2={size - 8} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
      <line x1={8} y1={radius} x2={size - 8} y2={radius} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
      <line
        x1={radius - (radius - 10) * 0.707}
        y1={radius - (radius - 10) * 0.707}
        x2={radius + (radius - 10) * 0.707}
        y2={radius + (radius - 10) * 0.707}
        stroke="rgba(255,255,255,0.025)"
        strokeWidth={1}
      />
      <line
        x1={radius + (radius - 10) * 0.707}
        y1={radius - (radius - 10) * 0.707}
        x2={radius - (radius - 10) * 0.707}
        y2={radius + (radius - 10) * 0.707}
        stroke="rgba(255,255,255,0.025)"
        strokeWidth={1}
      />
    </svg>
  );
}
