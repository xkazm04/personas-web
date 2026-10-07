import type { LucideIcon } from "lucide-react";
import type { ObserveSectionCopy } from "@/i18n/pending/observeSection";

type ObserveCopy = ObserveSectionCopy;
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
  /** Title and blurb are `observeSectionCopy.modules[id]`. */
  id: keyof ObserveCopy["modules"];
  icon: LucideIcon;
  color: string;
  filterPrefix: string;
}
