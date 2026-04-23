"use client";

import { useTranslation } from "@/i18n/useTranslation";

export interface NavRoute {
  label: string;
  href: string;
}

/** Primary site navigation — rendered in both desktop pill bar and mobile slide-in panel. */
export function useRoutes(): NavRoute[] {
  const { t } = useTranslation();
  return [
    { label: t.nav.home, href: "/" },
    { label: t.nav.features, href: "/features" },
    { label: t.nav.templates, href: "/templates" },
    { label: t.nav.roadmap, href: "/roadmap" },
  ];
}
