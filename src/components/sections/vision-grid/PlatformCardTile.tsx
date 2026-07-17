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
  const panelId = `platform-card-panel-${card.id}`;

  return (
    // Non-interactive wrapper: the toggle is a real <button> overlay (below)
    // and the panel's controls are its siblings, so there are no interactive
    // descendants nested inside a button (WCAG 4.1.2). tabIndex={-1} keeps it
    // programmatically focusable for the hook's focus-return on close.
    <motion.div
      ref={cardRef}
      data-card-id={card.id}
      variants={cardVariants}
      tabIndex={-1}
      className="group relative block w-full overflow-hidden rounded-2xl border text-left h-[380px] transition-all duration-500 hover:scale-[1.01] focus-visible:outline-none"
      style={{
        borderColor: "var(--border-glass-hover)",
        backgroundColor: "color-mix(in srgb, var(--background) 70%, transparent)",
      }}
    >
      <PlatformCardBackdrop card={card} open={open} />

      {/* Toggle overlay — spans the card, sits beneath the panel (z-20) so a
          click inside the open panel hits the panel, not this toggle. */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${card.title} — ${open ? "hide" : "reveal"} details`}
        className="absolute inset-0 z-10 cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-inset"
      />

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-5">
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
        panelId={panelId}
        brandVar={brandVar}
        panelRef={panelRef}
        closeRef={closeRef}
        onClose={close}
      />
    </motion.div>
  );
}
