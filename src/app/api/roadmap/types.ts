import type { RoadmapItem } from "@/components/sections/roadmap/types";

export type RoadmapResponseSource = "supabase" | "none" | "error";

export interface RoadmapResponse {
  items: RoadmapItem[];
  source: RoadmapResponseSource;
}
