import {
  Clock,
  Mouse,
  Radio,
  Webhook,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "@/lib/templates";

export const triggerIcons: Record<string, LucideIcon> = {
  schedule: Clock,
  webhook: Webhook,
  manual: Mouse,
  event: Zap,
  polling: Radio,
};

export const categoryAccent: Record<Category, string> = {
  DevOps: "border-brand-purple",
  Communication: "border-brand-cyan",
  Productivity: "border-brand-emerald",
  Finance: "border-green-400",
  Sales: "border-orange-400",
  Support: "border-cyan-400",
  Research: "border-violet-400",
  Marketing: "border-pink-400",
  Legal: "border-stone-400",
  Security: "border-red-400",
};

export const CATEGORY_IMAGES: Record<Category, { dark: string; light: string }> = {
  DevOps: { dark: "/imgs/templates/devops-dark.png", light: "/imgs/templates/devops-light.png" },
  Communication: { dark: "/imgs/templates/communication-dark.png", light: "/imgs/templates/communication-light.png" },
  Productivity: { dark: "/imgs/templates/productivity-dark.png", light: "/imgs/templates/productivity-light.png" },
  Finance: { dark: "/imgs/templates/finance-dark.png", light: "/imgs/templates/finance-light.png" },
  Sales: { dark: "/imgs/templates/sales-dark.png", light: "/imgs/templates/sales-light.png" },
  Support: { dark: "/imgs/templates/support-dark.png", light: "/imgs/templates/support-light.png" },
  Research: { dark: "/imgs/templates/research-dark.png", light: "/imgs/templates/research-light.png" },
  Marketing: { dark: "/imgs/templates/marketing-dark.png", light: "/imgs/templates/marketing-light.png" },
  Legal: { dark: "/imgs/templates/legal-dark.png", light: "/imgs/templates/legal-light.png" },
  Security: { dark: "/imgs/templates/security-dark.png", light: "/imgs/templates/security-light.png" },
};

export type Complexity = "basic" | "professional" | "enterprise";
