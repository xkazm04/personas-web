"use client";

import GuideNotFound from "@/components/guide/GuideNotFound";
import { useTranslation } from "@/i18n/useTranslation";

export default function GuideCategoryNotFound() {
  const { t } = useTranslation();
  return (
    <GuideNotFound
      title={t.guide.categoryNotFound.title}
      description={t.guide.categoryNotFound.description}
    />
  );
}
