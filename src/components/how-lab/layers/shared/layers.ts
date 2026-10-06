import { Activity, Monitor, Wand2, Zap, type LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

/** The four platform layers the live section presents, bottom to top. */
export type LayerId = "run" | "coordinate" | "design" | "monitor";

export interface LayerDef {
  id: LayerId;
  brand: BrandKey;
  icon: LucideIcon;
}

export const LAYERS: readonly LayerDef[] = [
  { id: "run", brand: "emerald", icon: Monitor },
  { id: "coordinate", brand: "cyan", icon: Zap },
  { id: "design", brand: "purple", icon: Wand2 },
  { id: "monitor", brand: "amber", icon: Activity },
];

/** Real connector marks (public/tools/*.svg) the coordinate layer chains. */
export type ToolId = "gmail" | "slack" | "github" | "notion" | "linear";
