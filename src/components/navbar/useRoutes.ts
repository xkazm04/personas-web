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
    { label: t.nav.useCases, href: "/use-cases" },
    { label: t.nav.guide, href: "/guide" },
    { label: t.nav.compare, href: "/compare" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.roadmap, href: "/roadmap" },
  ];
}
