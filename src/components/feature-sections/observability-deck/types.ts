import type { LucideIcon } from "lucide-react";
import type { Translations } from "@/i18n/en";

type ObserveCopy = Translations["observeSection"];
export type AgentId = keyof ObserveCopy["agents"];

export interface ActivityRow {
  time: string;
  agent: string;
  event: string;
  duration: string;
  cost: string;
  color: string;
}

export interface OverviewModule {
  /** Title and blurb are `t.observeSection.modules[id]`. */
  id: keyof ObserveCopy["modules"];
  icon: LucideIcon;
  color: string;
  filterPrefix: string;
}
