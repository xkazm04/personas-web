import type { CSSProperties } from "react";
import type { LabTool } from "./catalog";

/**
 * A connector's real brand mark, drawn from its catalog SVG as a CSS mask so
 * it takes `currentColor`: one tone that follows the theme (and a brand tint
 * when chosen) instead of the catalog file's hard-coded fill.
 */
export default function ToolGlyph({ tool, className = "", style }: { tool: LabTool; className?: string; style?: CSSProperties }) {
  const mask = `url(/tools/${tool.icon}.svg) center / contain no-repeat`;
  return (
    <span
      aria-hidden="true"
      className={`block bg-current ${className}`}
      style={{ WebkitMask: mask, mask, ...style }}
    />
  );
}
