import type { CSSProperties } from "react";

/** Brand files in public/tools that carry their own colours; the rest are
 *  `fill="currentColor"` silhouettes, which an <img> would paint black. */
const MULTICOLOR = new Set(["python", "redis"]);
/** Catalogue ids whose own file is a generic Google "G": use the product mark. */
const ALIAS: Record<string, string> = { calendar: "google-calendar", drive: "google-drive" };

/**
 * A real tool's mark from public/tools (the connector catalogue's files).
 * Silhouettes are painted through a CSS mask so they take a themed colour.
 */
export default function ToolMark({
  id,
  className = "h-6 w-6",
  color = "var(--foreground)",
  style,
}: {
  id: string;
  className?: string;
  color?: string;
  style?: CSSProperties;
}) {
  const file = ALIAS[id] ?? id;
  const src = `/tools/${file}.svg`;
  if (MULTICOLOR.has(file)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- tiny static brand mark, no layout shift
      <img src={src} alt="" aria-hidden="true" className={`block shrink-0 object-contain ${className}`} style={style} />
    );
  }
  const url = `url(${src})`;
  return (
    <span
      aria-hidden="true"
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
    />
  );
}
