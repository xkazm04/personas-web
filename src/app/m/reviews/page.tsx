"use client";

import { useTranslation } from "@/i18n/useTranslation";

export default function MobileReviewsPage() {
  const { t } = useTranslation();
  return <h1 className="text-xl font-bold tracking-tight">{t.dashboard.reviews}</h1>;
}
