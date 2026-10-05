"use client";

import { useTranslation } from "@/i18n/useTranslation";

/** Placeholder while a prototype's chunk loads; fills the stage frame. */
export default function StageLoading() {
  const { t } = useTranslation();
  return (
    <div role="status" className="flex h-full items-center justify-center text-sm text-muted-dark">
      {t.fleetPlayground.loading}
    </div>
  );
}
