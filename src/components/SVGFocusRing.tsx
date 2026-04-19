"use client";

const CYAN = "#06b6d4";

export function SVGFocusRingCircle({
  cx,
  cy,
  r,
  offset = 2,
  strokeWidth = 0.5,
}: {
  cx: number;
  cy: number;
  r: number;
  offset?: number;
  strokeWidth?: number;
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r + offset}
      fill="none"
      stroke={CYAN}
      strokeWidth={strokeWidth}
      className="svg-focus-ring pointer-events-none opacity-0 transition-opacity"
    />
  );
}

export function SVGFocusRingRect({
  x,
  y,
  width,
  height,
  offset = 2,
  strokeWidth = 0.5,
  rx = 1,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  offset?: number;
  strokeWidth?: number;
  rx?: number;
}) {
  return (
    <rect
      x={x - offset}
      y={y - offset}
      width={width + offset * 2}
      height={height + offset * 2}
      rx={rx}
      fill="none"
      stroke={CYAN}
      strokeWidth={strokeWidth}
      className="svg-focus-ring pointer-events-none opacity-0 transition-opacity"
    />
  );
}
