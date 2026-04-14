import type { BrandKey } from "@/lib/brand-theme";
import type { RoadmapItem } from "./types";

export const FALLBACK_ITEMS: RoadmapItem[] = [
  { id: "1", name: "Dev Mode", description: "Tools for developers to build and test agents faster — with instant preview and debugging.", status: "in_progress", priority: "now", sort_order: 1 },
  { id: "2", name: "Cloud Integration", description: "Run your agents 24/7 in the cloud, even when your computer is off.", status: "in_progress", priority: "now", sort_order: 2 },
  { id: "3", name: "Web App", description: "This website — where you can learn about Personas, sign up, and manage your account.", status: "in_progress", priority: "now", sort_order: 3 },
  { id: "4", name: "Internationalization", description: "Support for 15+ languages so anyone around the world can use Personas in their own language.", status: "in_progress", priority: "now", sort_order: 4 },
  { id: "5", name: "Distribution & Polish", description: "One-click installers for Windows, Mac, and Linux with automatic updates and a smooth first-time experience.", status: "next", priority: "next", sort_order: 5 },
  { id: "6", name: "Team (Group Projects)", description: "Work together with your team — shared agents, collaborative editing, and team dashboards.", status: "next", priority: "next", sort_order: 6 },
];

export const statusConfig: Record<
  RoadmapItem["status"],
  {
    labelKey: "inProgress" | "next" | "planned" | "completed";
    brand: BrandKey | "muted";
    pulse?: boolean;
  }
> = {
  in_progress: { labelKey: "inProgress", brand: "cyan", pulse: true },
  next: { labelKey: "next", brand: "purple" },
  planned: { labelKey: "planned", brand: "muted" },
  completed: { labelKey: "completed", brand: "emerald" },
};

export const priorityBrand: Record<RoadmapItem["priority"], BrandKey | "muted"> = {
  now: "cyan",
  next: "purple",
  later: "muted",
};
