import type { BrandKey } from "@/lib/brand-theme";

const authTypeLabels: Record<string, string> = {
  PAT: "Personal Access Token",
};

export function friendlyAuthType(raw: string): string {
  return authTypeLabels[raw] ?? raw;
}

// Map data-connector accents to brand keys
export const accentBrandMap: Record<string, BrandKey> = {
  cyan: "cyan",
  purple: "purple",
  emerald: "emerald",
  amber: "amber",
};
