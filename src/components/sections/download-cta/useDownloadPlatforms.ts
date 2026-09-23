import { Apple, Monitor, Terminal } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import type { DownloadPlan } from "@/lib/release";

import type { Platform } from "./downloadCtaTypes";

/** A platform is "available" only when the release plan says it downloads. */
export function useDownloadPlatforms(plan: DownloadPlan): Platform[] {
  const { t } = useTranslation();

  return [
    { key: "windows", icon: Monitor, label: t.downloadSection.windows, available: plan.platforms.windows === "download" },
    { key: "macos", icon: Apple, label: t.downloadSection.macos, available: plan.platforms.macos === "download" },
    { key: "linux", icon: Terminal, label: t.downloadSection.linux, available: plan.platforms.linux === "download" },
  ];
}
