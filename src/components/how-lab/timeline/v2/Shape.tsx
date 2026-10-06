import type { SVGProps } from "react";
import { r2 } from "../shared/motion";
import type { ShapeKind } from "./data";

/** One sorter shape of radius `r`, centred on the origin. */
export default function Shape({ kind, r, ...rest }: { kind: ShapeKind; r: number } & SVGProps<SVGElement>) {
  const props = rest as SVGProps<SVGPathElement>;
  if (kind === "circle") return <circle r={r} {...(props as SVGProps<SVGCircleElement>)} />;
  if (kind === "square") {
    const s = r * 0.88;
    return <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={r * 0.16} {...(props as SVGProps<SVGRectElement>)} />;
  }
  const n = kind === "triangle" ? 3 : 6;
  const rr = kind === "triangle" ? r * 1.18 : r;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return `${r2(Math.cos(a) * rr)},${r2(Math.sin(a) * rr + (kind === "triangle" ? r * 0.2 : 0))}`;
  });
  return <polygon points={pts.join(" ")} strokeLinejoin="round" {...(props as SVGProps<SVGPolygonElement>)} />;
}
