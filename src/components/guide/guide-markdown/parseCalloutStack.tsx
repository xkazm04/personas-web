import type { ReactNode } from "react";

import { CalloutStack } from "../GuideBlocks";
import { parseInline } from "./parseInline";

const VALID_TYPES = new Set(["tip", "warning", "info", "success"]);

export function parseCalloutStack(lines: string[], keyBase: string): ReactNode | null {
  const items: { type: string; text: string }[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^\[(tip|warning|info|success)\]\s*(.*)$/i);
    if (m && VALID_TYPES.has(m[1].toLowerCase())) {
      items.push({ type: m[1].toLowerCase(), text: m[2] });
    } else if (items.length > 0) {
      const last = items[items.length - 1];
      last.text = `${last.text}${last.text ? " " : ""}${trimmed}`;
    }
  }
  if (items.length === 0) return null;
  return (
    <CalloutStack
      items={items.map((item, i) => ({
        type: item.type,
        node: <p>{parseInline(item.text, `${keyBase}-s${i}`)}</p>,
      }))}
    />
  );
}
