"use client";

import { parseBlocks } from "./guide-markdown/parseBlocks";

interface GuideMarkdownProps {
  content: string;
}

export default function GuideMarkdown({ content }: GuideMarkdownProps) {
  return <div className="prose-custom max-w-none">{parseBlocks(content.split("\n"))}</div>;
}
