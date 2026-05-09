import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface Layer {
  id: string;
  label: string;
  pillar: string;
  icon: LucideIcon;
  color: string;
  rgb: string;
  tw: {
    border: string;
    bg: string;
    text: string;
    glow: string;
    labelBg: string;
    labelBorder: string;
  };
  description: string;
  visual: ReactNode;
}
