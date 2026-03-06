export type Feature = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
  seedVotes: number;
};

export interface ShippedInfo {
  feature_id: string;
  changelog: string;
  link: string;
  shipped_at: string;
}

export const accentTokens: Record<
  Feature["accent"],
  { r: number; g: number; b: number; tw: string }
> = {
  cyan:    { r: 6,   g: 182, b: 212, tw: "brand-cyan"    },
  purple:  { r: 168, g: 85,  b: 247, tw: "brand-purple"  },
  emerald: { r: 52,  g: 211, b: 153, tw: "brand-emerald" },
  amber:   { r: 251, g: 191, b: 36,  tw: "brand-amber"   },
};
