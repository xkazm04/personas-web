"use client";

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { QueueVariant } from "../data";
import { variantTabs } from "../data";

/**
 * Accessible tablist for the EventBus visualization variants. Includes
 * left/right arrow-key navigation and an animated indicator that
 * springs between the active tab. Extracted from event-bus-showcase
 * index.tsx to keep that file focused on composition.
 */
export default function VariantTabs({
  uid,
  variant,
  onChange,
}: {
  uid: string;
  variant: QueueVariant;
  onChange: (next: QueueVariant) => void;
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = variantTabs.findIndex((t) => t.id === variant);
      let nextIndex: number | null = null;

      if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % variantTabs.length;
      else if (e.key === "ArrowLeft") nextIndex = (currentIndex - 1 + variantTabs.length) % variantTabs.length;

      if (nextIndex !== null) {
        e.preventDefault();
        onChange(variantTabs[nextIndex].id);
        tabRefs.current[nextIndex]?.focus();
      }
    },
    [variant, onChange],
  );

  return (
    <div
      role="tablist"
      aria-label="Event bus visualization"
      className="mb-4 flex items-center justify-center gap-1"
    >
      {variantTabs.map((tab, index) => {
        const isActive = variant === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            id={`${uid}-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`${uid}-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={handleKeyDown}
            className="group relative px-5 py-2.5 text-base font-mono uppercase tracking-wider transition-colors duration-200"
            style={isActive ? { color: BRAND_VAR.cyan } : undefined}
          >
            <span>{tab.label}</span>
            <span className="ml-2 text-base normal-case tracking-normal text-muted group-hover:text-foreground/80">
              {tab.hint}
            </span>
            {isActive && (
              <motion.div
                layoutId={`${uid}-tab-indicator`}
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{
                  backgroundColor: BRAND_VAR.cyan,
                  boxShadow: `0 0 12px ${tint("cyan", 40)}, 0 0 4px ${tint("cyan", 60)}`,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
