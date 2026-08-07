"use client";

import GuideNotFound from "@/components/guide/GuideNotFound";
import { useTranslation } from "@/i18n/useTranslation";

export default function GuideTopicNotFound() {
  const { t } = useTranslation();
  return (
    <GuideNotFound
      title={t.guide.topicNotFound.title}
      description={t.guide.topicNotFound.description}
    />
  );
}
