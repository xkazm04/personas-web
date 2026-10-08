import type { CSSProperties } from "react";

/**
 * A real tool's brand mark (public/tools/*.svg, the same files the connector
 * catalogue uses), painted through a CSS mask so it takes any themed colour:
 * the files are `fill="currentColor"` silhouettes, which an <img> would render
 * black in every theme.
 */
export type ToolId = "slack" | "gmail" | "github" | "notion" | "linear" | "google-calendar";

export function ToolGlyph({
  tool,
  color = "var(--foreground)",
  className = "h-5 w-5",
  style,
}: {
  tool: ToolId;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const url = `url(/tools/${tool}.svg)`;
  return (
    <span
      className={`block shrink-0 ${className}`}
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
      aria-hidden="true"
    />
  );
}
