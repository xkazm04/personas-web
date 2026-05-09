"use client";

interface Props {
  size: number;
  radius: number;
  sweepAngle: number;
}

export default function RadarSweep({ size, radius, sweepAngle }: Props) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ transform: `rotate(${sweepAngle}deg)`, willChange: "transform" }}
    >
      <div
        className="absolute"
        style={{
          top: radius,
          left: radius,
          width: radius - 10,
          height: 1,
          transformOrigin: "0% 50%",
          background: "linear-gradient(90deg, rgba(6,182,212,0.35), transparent)",
        }}
      />
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <linearGradient id="sweep-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(6,182,212,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d={`M ${radius} ${radius} L ${size - 10} ${radius} A ${radius - 10} ${radius - 10} 0 0 0 ${
            radius + (radius - 10) * Math.cos((-30 * Math.PI) / 180)
          } ${radius + (radius - 10) * Math.sin((-30 * Math.PI) / 180)} Z`}
          fill="url(#sweep-grad)"
        />
      </svg>
    </div>
  );
}
