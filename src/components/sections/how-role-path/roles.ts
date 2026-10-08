import { BarChart3, Shield, Terminal, type LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

/** Who is reading /how. The page owns the choice; the opening section sets it
 *  and the events stage below retints with it. */
export type ViewerRole = "developer" | "product-manager" | "enterprise";

/** The key a role's copy lives under in `howSections.rolePath`. */
export type RoleCopyKey = "developer" | "productManager" | "enterprise";

export interface RoleDef {
  id: ViewerRole;
  copy: RoleCopyKey;
  icon: LucideIcon;
  brand: BrandKey;
}

export const ROLES: readonly RoleDef[] = [
  { id: "developer", copy: "developer", icon: Terminal, brand: "cyan" },
  { id: "product-manager", copy: "productManager", icon: BarChart3, brand: "purple" },
  { id: "enterprise", copy: "enterprise", icon: Shield, brand: "emerald" },
];

export const roleDef = (id: ViewerRole): RoleDef => ROLES.find((r) => r.id === id) ?? ROLES[0];

/** The four sections below the opener, in page order (hrefs are the
 *  StageSection anchors on /how and must stay stable). */
export const STOP_HREFS = ["#agents-timeline", "#agents-chat", "#platform-layers", "#event-bus"] as const;
