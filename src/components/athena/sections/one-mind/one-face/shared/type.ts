import type { CSSProperties } from "react";

/**
 * In-art type that grows with the stage.
 *
 * The art slot is a size container (stage.css makes it one on the desktop
 * stage; StageShell makes it one below it too), so `cqh` here is a share of
 * the art's own height. A 1366x657 laptop and a 2560x1300 monitor therefore
 * see the same composition with the type at the same proportion, and the
 * floors keep reading text at text-base and labels above 12px on the smallest
 * stage. Every size is a custom property, read where it is used, so a part
 * resolves `cqh` against the slot rather than against whatever it sits in.
 * Each size is also capped by the slot's WIDTH (cqw), so a tall, narrow
 * phone slot keeps text at its floor instead of growing with the height.
 */
export const TYPE_VARS = {
  "--om-label": "clamp(0.8125rem, min(2.05cqh, 1.2cqw), 1.125rem)",
  "--om-body": "clamp(1rem, min(2.75cqh, 1.6cqw), 1.55rem)",
  "--om-big": "clamp(1.0625rem, min(3.2cqh, 1.9cqw), 1.85rem)",
} as CSSProperties;

export const LABEL: CSSProperties = { fontSize: "var(--om-label)" };
export const BODY: CSSProperties = { fontSize: "var(--om-body)" };
export const BIG: CSSProperties = { fontSize: "var(--om-big)" };

/** The mono console voice at in-art size (ANNOTATION without its fixed size). */
export const MONO = "font-mono uppercase tracking-[0.16em]";
