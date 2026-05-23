"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { BRAND_VAR, tint } from "@/lib/brand-theme";

import type { PlatformCard } from "./data";
import { PlatformCardBackdrop } from "./platform-card-tile/PlatformCardBackdrop";
import { PlatformCardPanel } from "./platform-card-tile/PlatformCardPanel";
import { usePlatformCardDisclosure } from "./platform-card-tile/usePlatformCardDisclosure";

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function PlatformCardTile({ card }: { card: PlatformCard }) {
  const {
    open,
    setOpen,
    close,
    cardRef,
    panelRef,
    closeRef,
  } = usePlatformCardDisclosure();
  const brandVar = BRAND_VAR[card.brand];

  return (
    <motion.div
      ref={cardRef}
      data-card-id={card.id}
      variants={cardVariants}
      role="button"
      tabIndex={0}
      onClick={() => setOpen((value) => !value)}
      onKeyDown={(e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          setOpen((value) => !value);
        }
      }}
      aria-expanded={open}
      className="group relative block w-full overflow-hidden rounded-2xl border text-left h-[380px] cursor-pointer transition-all duration-500 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2"
      style={{
        borderColor: "var(--border-glass-hover)",
        backgroundColor: "color-mix(in srgb, var(--background) 70%, transparent)",
      }}
    >
      <PlatformCardBackdrop card={card} open={open} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5">
        <div className="flex items-center gap-3 transition-all duration-300 group-hover:-translate-y-1">
          <h3
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-center"
            style={{
              color: brandVar,
              textShadow: `0 0 24px ${tint(card.brand, 65)}, 0 2px 12px color-mix(in srgb, var(--background) 80%, transparent)`,
            }}
          >
            {card.title}
          </h3>
          <ArrowRight
            className="h-7 w-7 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
            style={{
              color: brandVar,
              filter: `drop-shadow(0 0 8px ${tint(card.brand, 60)})`,
            }}
          />
        </div>
        <div
          className="mt-3 text-base font-mono uppercase tracking-widest opacity-0 transition-opacity duration-300 group-hover:opacity-70"
          style={{ color: "rgba(var(--surface-overlay), 0.7)" }}
        >
          {open ? "Click to hide" : "Click to reveal"}
        </div>
      </div>

      <PlatformCardPanel
        card={card}
        open={open}
        brandVar={brandVar}
        panelRef={panelRef}
        closeRef={closeRef}
        onClose={close}
      />
    </motion.div>
  );
}
