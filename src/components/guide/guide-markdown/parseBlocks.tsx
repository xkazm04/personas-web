import type { ReactNode } from "react";

import { parseGuide } from "./parseGuide";
import { renderGuideDoc } from "./renderGuideDoc";

const DEV = process.env.NODE_ENV === "development";

/** Markdown lines -> React: `renderGuideDoc(parseGuide(lines).doc)`. */
export function parseBlocks(lines: string[], opts: { copyAnchorLabel?: string } = {}): ReactNode[] {
  const { doc, diagnostics } = parseGuide(lines);
  // Content typos must not vanish silently. Production renders around them
  // (and `npm run check:guide-content` fails on them); development says so.
  if (DEV) {
    for (const d of diagnostics) console.warn(`[guide] line ${d.line}: ${d.message}: ${d.text.trim()}`);
  }
  return renderGuideDoc(doc, opts);
}
