"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { BOOST_TIERS, KOFI_USERNAME } from "../data";

export default function FeatureBoostButton({
  featureId,
  boostCount,
  showTiers,
  setShowTiers,
  onBoost,
  rgba,
}: {
  featureId: string;
  boostCount: number;
  showTiers: boolean;
  setShowTiers: (v: boolean) => void;
  onBoost: (featureId: string, weight: number) => void;
  rgba: (a: number) => string;
}) {
  return (
    <div className="relative shrink-0">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowTiers(!showTiers);
        }}
        className="flex items-center gap-1 rounded-full border px-2 py-1 text-base font-medium transition-all duration-300 cursor-pointer"
        style={
          boostCount > 0
            ? {
                borderColor: rgba(0.25),
                backgroundColor: rgba(0.1),
                color: rgba(0.9),
              }
            : {
                borderColor: "rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.02)",
                color: "var(--muted-dark)",
              }
        }
      >
        <Rocket className="h-3 w-3" />
        {boostCount > 0 && <span className="tabular-nums">{boostCount}</span>}
      </button>

      <AnimatePresence>
        {showTiers && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 flex items-center gap-1.5 rounded-xl border border-glass-hover bg-background/95 backdrop-blur-xl px-2.5 py-2 shadow-2xl z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-base text-muted-dark/60 font-mono mr-1">Boost</span>
            {BOOST_TIERS.map((tier) => (
              <a
                key={tier.value}
                href={`https://ko-fi.com/${KOFI_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  onBoost(featureId, tier.weight);
                  setShowTiers(false);
                }}
                className="rounded-lg border px-2.5 py-1 text-base font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{
                  borderColor: rgba(0.2),
                  backgroundColor: rgba(0.06),
                  color: rgba(0.9),
                }}
              >
                {tier.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
