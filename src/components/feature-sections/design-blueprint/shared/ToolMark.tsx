import type { CSSProperties } from "react";

/**
 * A connector's real brand mark (`public/tools/<name>.svg`) drawn as a CSS
 * mask, so it takes `currentColor` and follows the theme instead of the
 * file's hard-coded fill.
 */
export default function ToolMark({ name, className = "", style }: { name: string; className?: string; style?: CSSProperties }) {
  const mask = `url(/tools/${name}.svg) center / contain no-repeat`;
  return <span aria-hidden="true" className={`inline-block shrink-0 bg-current ${className}`} style={{ WebkitMask: mask, mask, ...style }} />;
}
