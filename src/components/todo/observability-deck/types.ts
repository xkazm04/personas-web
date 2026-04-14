import type { LucideIcon } from "lucide-react";

export interface ActivityRow {
  time: string;
  agent: string;
  event: string;
  duration: string;
  cost: string;
  color: string;
}

export interface OverviewModule {
  icon: LucideIcon;
  title: string;
  blurb: string;
  color: string;
}
