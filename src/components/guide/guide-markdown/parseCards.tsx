import type { ReactNode } from "react";

import { CardsBlock, type CardItem } from "../GuideBlocks";
import { parseInline } from "./parseInline";

const VALID_STATUSES = new Set<CardItem["status"]>(["available", "roadmap", "disabled"]);

export function parseCards(lines: string[], keyBase: string): ReactNode | null {
  const items: CardItem[] = [];
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const m = trimmed.match(/^\[(available|roadmap|disabled)\]\s*(.+)$/i);
    if (!m) return;
    const status = m[1].toLowerCase() as CardItem["status"];
    if (!VALID_STATUSES.has(status)) return;
    const parts = m[2].split("|").map((p) => p.trim());
    const [title, descRaw, imageBase] = parts;
    if (!title) return;
    items.push({
      status,
      title,
      description: <>{descRaw ? parseInline(descRaw, `${keyBase}-c${i}`) : null}</>,
      imageBase: imageBase || undefined,
    });
  });
  if (items.length === 0) return null;
  return <CardsBlock items={items} />;
}
