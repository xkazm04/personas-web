import type { LucideIcon } from "lucide-react";

export interface TimelineStage {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  timing: string;
  duration: number;
}

export interface ExamplePrompt {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  prompt: string;
  stages: TimelineStage[];
}

export type StageStatus = "locked" | "active" | "done";
export type TimelinePhase = "idle" | "running" | "done";
