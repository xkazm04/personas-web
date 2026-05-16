import { BookOpen, Sparkles, Zap } from "lucide-react";

import type { GuideMode } from "@/data/guide/types";
import type { BrandKey } from "@/lib/brand-theme";

export const MODE_OPTIONS: Array<{
  value: GuideMode | null;
  label: string;
  icon: typeof Sparkles;
  brand: BrandKey;
}> = [
  { value: null, label: "All modes", icon: BookOpen, brand: "cyan" },
  { value: "simple", label: "Simple", icon: Sparkles, brand: "amber" },
  { value: "power", label: "Power", icon: Zap, brand: "blue" },
];
