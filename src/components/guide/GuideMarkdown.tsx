"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { parseBlocks } from "./guide-markdown/parseBlocks";

interface GuideMarkdownProps {
  content: string;
}

export default function GuideMarkdown({ content }: GuideMarkdownProps) {
  const { t } = useTranslation();
  return (
    <div className="prose-custom max-w-none">
      {parseBlocks(content.split("\n"), { copyAnchorLabel: t.guide.copyAnchor })}
    </div>
  );
}
