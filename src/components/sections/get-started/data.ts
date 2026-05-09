import { Download, ShieldCheck, Sparkles, Zap, Dna } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

export const STEP_ICONS: LucideIcon[] = [Download, ShieldCheck, Sparkles, Zap, Dna];

/**
 * Map the legacy hex colors in TOUR_STEPS to BrandKey — keeps the data
 * source (src/data/tour.ts) untouched while rendering theme-adaptively.
 */
export const STEP_BRAND: BrandKey[] = ["cyan", "purple", "emerald", "amber", "rose"];

export const AUTO_ADVANCE_MS = 7000;
