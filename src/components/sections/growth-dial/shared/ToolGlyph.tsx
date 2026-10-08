import type { CSSProperties } from "react";
import type { ToolId } from "./layers";

/**
 * A real tool's brand mark (public/tools/*.svg, the connector catalogue's
 * files), painted through a CSS mask so it takes a themed colour: the files are
 * `fill="currentColor"` silhouettes, which an <img> would paint black.
 */
export function ToolGlyph({
  tool,
  color = "var(--foreground)",
  style,
}: {
  tool: ToolId;
  color?: string;
  style?: CSSProperties;
}) {
  const url = `url(/tools/${tool}.svg)`;
  return (
    <span
      aria-hidden="true"
      className="block shrink-0"
      style={{
        backgroundColor: color,
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        ...style,
      }}
    />
  );
}

/**
 * The same mark inside an SVG: an alpha mask over a filled rect, so it scales
 * with the drawing's viewBox and still takes a themed colour.
 */
export function SvgToolGlyph({
  id,
  tool,
  x,
  y,
  size,
  color = "var(--foreground)",
}: {
  id: string;
  tool: ToolId;
  x: number;
  y: number;
  size: number;
  color?: string;
}) {
  return (
    <g aria-hidden="true">
      <mask id={id} style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x={x} y={y} width={size} height={size}>
        <image href={`/tools/${tool}.svg`} x={x} y={y} width={size} height={size} />
      </mask>
      <rect x={x} y={y} width={size} height={size} fill={color} mask={`url(#${id})`} />
    </g>
  );
}
