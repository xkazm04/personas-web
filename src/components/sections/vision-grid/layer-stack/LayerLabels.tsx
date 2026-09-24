"use client";

import { useRef, type KeyboardEvent } from "react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { StackLayer } from "./layers";
import { LABELS_LEFT, STACK, slabMidY } from "./LayerPlates";

/**
 * The flat, readable side of the exploded diagram: one callout per slab,
 * aligned to the slab's right vertex by a short leader. The callouts are the
 * controls: a vertical tablist whose panel is the layer detail. Each tab also
 * stretches left over its slab, so clicking a slab selects it.
 */
export function LayerLabels({
  layers,
  activeIndex,
  onSelect,
  panelId,
  idPrefix,
}: {
  layers: StackLayer[];
  activeIndex: number;
  onSelect: (i: number) => void;
  panelId: string;
  idPrefix: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = layers.length - 1;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? (activeIndex === last ? 0 : activeIndex + 1)
      : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (activeIndex === 0 ? last : activeIndex - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    onSelect(next);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-orientation="vertical" aria-label="Platform layers" onKeyDown={onKey} className="absolute inset-0 z-30">
      {layers.map((layer, i) => {
        const on = i === activeIndex;
        const color = BRAND_VAR[layer.brand];
        return (
          <button
            key={layer.card.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${idPrefix}-tab-${layer.card.id}`}
            type="button"
            role="tab"
            // The guided tour steps through the layers by these ids (src/lib/tour-script.ts).
            data-card-id={layer.card.id}
            aria-selected={on}
            aria-controls={panelId}
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(i)}
            className="group absolute left-0 right-0 flex cursor-pointer items-center rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/70"
            style={{ top: `calc(${slabMidY(i)} - ${STACK.gap / 2}px)`, height: STACK.gap }}
          >
            {/* Leader from the slab's right vertex to the callout. */}
            <span
              aria-hidden
              className="absolute h-px transition-colors duration-300"
              style={{ left: `calc(${LABELS_LEFT} - 17px)`, width: 15, top: "50%", backgroundColor: on ? color : tint(layer.brand, 45) }}
            />
            <span
              className="absolute right-0 flex min-w-0 flex-col justify-center rounded-lg border px-2.5 py-1 transition-colors duration-300"
              style={{
                left: LABELS_LEFT,
                borderColor: on ? tint(layer.brand, 40) : "transparent",
                backgroundColor: on ? tint(layer.brand, 8) : undefined,
              }}
            >
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className="text-sm font-bold transition-colors duration-300"
                  style={{ color: on ? color : "var(--foreground)" }}
                >
                  {layer.card.title}
                </span>
              </span>
              <span className="line-clamp-2 text-xs leading-snug text-muted group-hover:text-foreground">{layer.job}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
