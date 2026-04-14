import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface GuideLink {
  label: string;
  category: string;
  topic: string;
}

export interface Feature {
  icon: LucideIcon;
  accent: "purple" | "cyan" | "emerald" | "amber";
  iconBg: string;
  iconColor: string;
  iconRing: string;
  iconGlow: string;
  number: string;
  title: string;
  proof: string;
  description: string;
  visual: ReactNode;
  guideTopics: GuideLink[];
}
