"use client";

import type { ComponentType } from "react";
import { LayoutDashboard } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export interface NavRoute {
  label: string;
  href: string;
  /**
   * How the entry is reached: a `tab` sits in the desktop pill bar, a
   * `utility` is the desktop's icon button beside the download CTA. The
   * mobile panel lists both, so a new entry needs only this registry.
   */
  kind: "tab" | "utility";
  icon?: ComponentType<{ className?: string }>;
}

/** Primary site navigation — the one list both the desktop bar and the mobile panel render. */
export function useRoutes(): NavRoute[] {
  const { t } = useTranslation();
  return [
    { label: t.nav.home, href: "/", kind: "tab" },
    { label: t.nav.features, href: "/features", kind: "tab" },
    { label: t.nav.roadmap, href: "/roadmap", kind: "tab" },
    { label: t.nav.dashboard, href: "/dashboard", kind: "utility", icon: LayoutDashboard },
  ];
}
