export type LampState = "ok" | "bad" | "sig" | null;

/** A status lamp drawn inside a figure's SVG (well plus lens). `blink` only runs while the figure is on screen. */
export default function FigureLamp({
  cx,
  cy,
  r,
  state,
  blink,
  className,
}: {
  cx: number;
  cy: number;
  r: number;
  state: LampState;
  blink?: boolean;
  className?: string;
}) {
  const cls = ["ln-ci-led", state && `ln-ci-led--${state}`, blink && "ln-ci-led--blink", className]
    .filter(Boolean)
    .join(" ");
  return (
    <g className={cls}>
      <circle className="ln-ci-led-well" cx={cx} cy={cy} r={r} />
      <circle className="ln-ci-led-lens" cx={cx} cy={cy} r={r * 0.667} />
    </g>
  );
}
