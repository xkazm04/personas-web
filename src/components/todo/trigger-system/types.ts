import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

export interface Trigger {
  icon: LucideIcon;
  name: string;
  brand: BrandKey;
  color: string;
  desc: string;
  detail: string;
  example: string;
}
