"use client";

import SectionIntro from "@/components/primitives/SectionIntro";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Thin client wrapper that feeds the localized `roadmapSection` copy into the
 * shared `SectionIntro`. The parent `index.tsx` is a server component (it reads
 * the build-time area counts), and the repo's translation access is client-only
 * (`useTranslation` reads the i18n Zustand store), so the intro strings are
 * resolved here rather than on the server.
 */
export default function RoadmapIntro() {
  const { t } = useTranslation();
  const r = t.roadmapSection;
  return <SectionIntro heading={r.heading} gradient={r.gradient} description={r.description} />;
}
