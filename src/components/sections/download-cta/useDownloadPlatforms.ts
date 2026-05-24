import { Apple, Monitor, Terminal } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

import type { Platform } from "./downloadCtaTypes";

export function useDownloadPlatforms(downloadUrl?: string): Platform[] {
  const { t } = useTranslation();

  return [
    { key: "windows", icon: Monitor, label: t.downloadSection.windows, available: !!downloadUrl },
    { key: "macos", icon: Apple, label: t.downloadSection.macos, available: false },
    { key: "linux", icon: Terminal, label: t.downloadSection.linux, available: false },
  ];
}
