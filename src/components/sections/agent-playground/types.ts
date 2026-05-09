import type { LucideIcon } from "lucide-react";

export interface SimLine {
  text: string;
  color?: string;
  delay: number; // ms after previous line
  indent?: number;
}

export interface ExamplePrompt {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  prompt: string;
  lines: SimLine[];
}
