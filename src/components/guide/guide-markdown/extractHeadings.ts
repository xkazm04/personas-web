import { slugifyHeading } from "./HeadingAnchor";

export interface GuideHeading {
  id: string;
  text: string;
  depth: 1 | 2 | 3 | 4;
}

export function extractHeadings(content: string): GuideHeading[] {
  const lines = content.split("\n");
  const headings: GuideHeading[] = [];
  const usedSlugs = new Map<string, number>();
  let inCodeFence = false;
  let inCustomBlock = false;
  let fallbackKey = 0;

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    if (trimmed.startsWith(":::")) {
      inCustomBlock = !inCustomBlock;
      continue;
    }
    if (inCustomBlock) continue;

    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (!match) continue;
    const depth = match[1].length as 1 | 2 | 3 | 4;
    const rawText = match[2];
    const baseSlug = slugifyHeading(rawText) || `section-${fallbackKey++}`;
    const count = usedSlugs.get(baseSlug) ?? 0;
    usedSlugs.set(baseSlug, count + 1);
    const id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
    const stripped = rawText
      .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1");
    headings.push({ id, text: stripped, depth });
  }

  return headings;
}
