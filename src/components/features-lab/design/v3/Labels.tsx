"use client";

import type { CSSProperties } from "react";
import type { DesignCopy, DimCopy } from "../shared/copy";
import { valueOf } from "../shared/copy";
import DecisionText from "../shared/DecisionText";
import type { DimKey } from "../shared/dims";
import type { DimPhase } from "../shared/timeline";
import { LABEL_W, labelBox, PETALS, u } from "./geometry";

const LABEL = "max(12px, 1.15cqw)";
const textInk = (ink: string) => `color-mix(in oklab, ${ink} 78%, var(--foreground))`;

/**
 * Each petal's annotation, just outside its tip: the dimension's name from
 * the start, the decision once it lands. They are buttons: pointing at one
 * (or focusing it) lights its petal and dims the rest.
 */
export default function Labels({
  copy,
  phases,
  answers,
  focus,
  setFocus,
  moving,
}: {
  copy: DesignCopy;
  phases: Record<DimKey, DimPhase>;
  answers: Partial<Record<DimKey, number>>;
  focus: DimKey | null;
  setFocus: (k: DimKey | null) => void;
  moving: boolean;
}) {
  const byKey = Object.fromEntries(copy.dims.map((d) => [d.key, d])) as Record<DimKey, DimCopy>;
  return (
    <>
      {PETALS.map(({ key, angle }) => {
        const d = byKey[key];
        const box = labelBox(angle);
        const p = phases[key];
        const done = p === "resolved";
        const shift = box.v === "bottom" ? "-100%" : box.v === "middle" ? "-50%" : "0%";
        const style: CSSProperties = { left: u(box.x), top: u(box.y), width: u(LABEL_W), transform: `translateY(${shift})` };
        return (
          <button
            key={key}
            type="button"
            onPointerEnter={() => setFocus(key)}
            onPointerLeave={() => setFocus(null)}
            onFocus={() => setFocus(key)}
            onBlur={() => setFocus(null)}
            className={`absolute flex flex-col rounded-lg px-[0.8cqw] py-[0.5cqw] transition-[background-color,opacity] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 ${box.right ? "items-start text-left" : "items-end text-right"}`}
            style={{ ...style, opacity: focus && focus !== key ? 0.45 : 1, backgroundColor: focus === key ? "rgba(var(--surface-overlay), 0.06)" : "transparent" }}
          >
            <span className={`flex flex-wrap items-baseline gap-x-2 ${box.right ? "" : "flex-row-reverse"}`}>
              <span
                className="font-mono font-bold uppercase tracking-[0.12em] transition-colors duration-500"
                style={{ fontSize: LABEL, color: p !== "pending" ? textInk(d.ink) : "color-mix(in srgb, var(--foreground) 62%, transparent)" }}
              >
                {d.label}
              </span>
              <span
                className="font-mono uppercase tracking-wider text-foreground/70"
                style={{ fontSize: LABEL, opacity: done ? 1 : 0, transition: moving ? "opacity .4s .4s" : "none" }}
              >
                {copy.lab.sources[d.source]}
              </span>
            </span>
            <span
              className="mt-[0.3cqw] font-medium leading-snug text-foreground"
              style={{ fontSize: "max(16px, 1.55cqw)", opacity: done ? 1 : 0, transform: done ? "none" : "translateY(4px)", transition: moving ? "opacity .45s .25s, transform .45s .25s" : "none" }}
            >
              <DecisionText value={valueOf(d, answers)} tools={d.tools} />
            </span>
          </button>
        );
      })}
    </>
  );
}
