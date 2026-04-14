export type RoadmapItem = {
  id: string;
  name: string;
  description: string;
  status: "in_progress" | "next" | "planned" | "completed";
  priority: "now" | "next" | "later";
  sort_order: number;
};
