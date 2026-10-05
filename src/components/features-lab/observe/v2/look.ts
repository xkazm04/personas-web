import { BRAND_VAR } from "@/lib/brand-theme";
import type { Step } from "./runs";

/* How a step looks in V2: one colour per kind (rose overrides on failure or
 * alert), and the number formats. */

export function stepColor(st: Step): string {
  if (st.status === "failed" || st.status === "alert") return BRAND_VAR.rose;
  switch (st.kind) {
    case "trigger":
      return BRAND_VAR.blue;
    case "model":
      return BRAND_VAR.purple;
    case "review":
      return BRAND_VAR.amber;
    case "memory":
    case "retry":
      return BRAND_VAR.emerald;
    default:
      return BRAND_VAR.cyan;
  }
}

export const fmtS = (v: number) => `${v.toFixed(1)}s`;
export const fmtCost = (v: number) => `$${v.toFixed(2)}`;
export const fmtTokens = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v ? String(v) : "-");
