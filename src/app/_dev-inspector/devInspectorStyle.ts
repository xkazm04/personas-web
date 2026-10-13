/**
 * Palette, layering and box styles shared by the {@link DevInspector} chrome in
 * devInspectorUi.tsx, plus the loc splitter its labels render with.
 * Dev-only; never ships to production.
 */

import type { CSSProperties } from "react";

export const Z = 2147483646;
export const ACCENT = "#38bdf8"; // cyan
const DIM = "#a855f7"; // purple — secondary (pointed) outline
export const OK = "#34d399"; // green — copy confirmation

/** Split `src/a/b/File.tsx:88` → `{ dir: 'src/a/b/', file: 'File.tsx:88' }`. */
export function splitLoc(loc: string): { dir: string; file: string } {
  const slash = loc.lastIndexOf("/");
  return slash === -1
    ? { dir: "", file: loc }
    : { dir: loc.slice(0, slash + 1), file: loc.slice(slash + 1) };
}

/** Solid accent outline for the target element, dashed purple for the pointed one. */
export function boxStyle(rect: DOMRect, variant: "target" | "pointer"): CSSProperties {
  const dashed = variant === "pointer";
  const color = dashed ? DIM : ACCENT;
  return {
    position: "fixed",
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    border: `${dashed ? 1 : 2}px ${dashed ? "dashed" : "solid"} ${color}`,
    borderRadius: 3,
    background: dashed ? "transparent" : `${color}1f`,
    pointerEvents: "none",
    boxSizing: "border-box",
    zIndex: Z,
  };
}

export const PANEL: CSSProperties = {
  position: "fixed",
  left: 12,
  bottom: 12,
  maxWidth: 460,
  pointerEvents: "auto",
  font: "12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
  color: "#e5e7eb",
  background: "rgba(17,24,39,0.94)",
  border: `1px solid ${ACCENT}66`,
  borderRadius: 8,
  boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
  padding: "8px 10px",
  backdropFilter: "blur(4px)",
};
