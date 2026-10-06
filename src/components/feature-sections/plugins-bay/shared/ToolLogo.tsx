import type { CSSProperties } from "react";

/**
 * A connector's real brand mark, drawn from its catalog SVG as a CSS mask so
 * it takes `currentColor`: one tone that follows the theme instead of the
 * file's hard-coded fill (a black Notion mark would vanish on a dark theme).
 */
export default function ToolLogo({
  icon,
  className = "",
  style,
}: {
  icon: string;
  className?: string;
  style?: CSSProperties;
}) {
  const mask = `url(/tools/${icon}.svg) center / contain no-repeat`;
  return (
    <span
      aria-hidden="true"
      className={`block bg-current ${className}`}
      style={{ WebkitMask: mask, mask, ...style }}
    />
  );
}
