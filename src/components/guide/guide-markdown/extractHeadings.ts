import { slugifyHeading } from "./HeadingAnchor";

export interface GuideHeading {
  id: string;
  text: string;
  depth: 1 | 2 | 3 | 4;
  tabLabels?: string[];
}

export function extractHeadings(content: string): GuideHeading[] {
  const lines = content.split("\n");
  const headings: GuideHeading[] = [];
  const usedSlugs = new Map<string, number>();
  let inCodeFence = false;
  let blockType: string | null = null;
  let fallbackKey = 0;

  const attachTab = (label: string) => {
    if (headings.length === 0) return;
    const last = headings[headings.length - 1];
    if (!last.tabLabels) last.tabLabels = [];
    last.tabLabels.push(label);
  };

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    const openMatch = trimmed.match(/^:::(\w[\w-]*)$/);
    if (openMatch && blockType === null) {
      blockType = openMatch[1];
      continue;
    }
    if (trimmed === ":::" && blockType !== null) {
      blockType = null;
      continue;
    }
    if (blockType !== null) {
      // Inside any custom block. For :::tabs, capture tab-label headings so
      // the TOC can surface them as informational chips on the parent
      // heading. Other block types (steps/keys/callouts/etc.) intentionally
      // produce no TOC entries.
      if (blockType === "tabs") {
        const tabMatch = line.match(/^###?\s+(.+)$/);
        if (tabMatch) attachTab(tabMatch[1].trim());
      }
      continue;
    }

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
