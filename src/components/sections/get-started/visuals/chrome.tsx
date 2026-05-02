"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The recurring "glass-overlay surface" treatment used by every step
 * visual (and several inner sub-elements). Extracted as a const so the
 * 8+ inline copies of this exact style block can become `style={SURFACE_GLASS}`.
 */
export const SURFACE_GLASS = {
  borderColor: "var(--border-glass-hover)",
  backgroundColor: "rgba(var(--surface-overlay), 0.02)",
} as const;

/**
 * Outer frame for a step visual. Centered flex column at full height.
 * `gap` defaults to "gap-4" (Create/Download/Work); pass "gap-5" for
 * Connect/Improve where the sub-elements are sparser.
 */
export function VisualFrame({
  children,
  gap = "gap-4",
}: {
  children: ReactNode;
  gap?: "gap-4" | "gap-5" | "gap-0";
}) {
  return (
    <div className={`flex h-full flex-col justify-center ${gap}`}>
      {children}
    </div>
  );
}

/**
 * Top badge pill: rounded-full border + bg + icon + uppercase mono label.
 * Used by Connect ("Credential Vault · AES-256") and Improve ("Breeding
 * cycle · fitness ↑") — the standard "what is this" header treatment.
 *
 * `align="center"` (default) stretches across the full width via mx-auto;
 * `align="fit"` shrinks to content width via `w-fit mx-auto`.
 */
export function VisualBadge({
  icon: Icon,
  label,
  color,
  align = "center",
}: {
  icon: LucideIcon;
  label: string;
  color: string;
  align?: "center" | "fit";
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
        align === "center" ? "mx-auto" : "w-fit mx-auto"
      }`}
      style={SURFACE_GLASS}
    >
      <Icon className="h-4 w-4" style={{ color }} />
      <span className="text-base font-mono uppercase tracking-wider text-foreground/80">
        {label}
      </span>
    </div>
  );
}

/**
 * Bordered horizontal row, used inside step visuals for list-style items
 * (Download platforms, Work events). Defaults to `rounded-xl px-4 py-3`;
 * override via className for tighter rows.
 */
export function VisualRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${className}`}
      style={SURFACE_GLASS}
    >
      {children}
    </div>
  );
}
