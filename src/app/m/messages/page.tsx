"use client";

import { useTranslation } from "@/i18n/useTranslation";

export default function MobileMessagesPage() {
  const { t } = useTranslation();
  return <h1 className="text-xl font-bold tracking-tight">{t.dashboard.messages}</h1>;
}
