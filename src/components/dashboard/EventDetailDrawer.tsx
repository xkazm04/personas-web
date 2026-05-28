"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { EVENT_TYPES, type SwarmNode } from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";

import { EventDrawerHeader } from "./event-detail-drawer/EventDrawerHeader";
import { EventDrawerMetadata } from "./event-detail-drawer/EventDrawerMetadata";
import { EventDrawerPayload } from "./event-detail-drawer/EventDrawerPayload";
import { EventDrawerSummary } from "./event-detail-drawer/EventDrawerSummary";
import { useDialogFocusTrap } from "./event-detail-drawer/useDialogFocusTrap";

const TITLE_ID = "event-detail-drawer-title";

interface EventDetailDrawerProps {
  node: SwarmNode | null;
  onClose: () => void;
}

export default function EventDetailDrawer({ node, onClose }: EventDetailDrawerProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [eventType] = useState(() => EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]);
  const [durationMs] = useState(() => Math.floor(200 + Math.random() * 4800));
  const [timestamp] = useState(() => new Date(Date.now() - Math.floor(Math.random() * 3600_000)).toISOString());

  // role=dialog/aria-modal + Esc-to-close + Tab focus trap + focus restore.
  const panelRef = useDialogFocusTrap(node !== null, onClose);

  // The bus has no boolean liveness flag, so derive status from the node's
  // real traffic volume instead of hardcoding "active" for every node:
  // a node carrying meaningful traffic is active, a quiet one is idle.
  const isActive = (node?.volume ?? 0) >= 0.5;

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-glass bg-background/95 backdrop-blur-xl"
          >
            <EventDrawerHeader
              node={node}
              nodeLabel={t.dashboardUi.node}
              closeLabel={t.common.close}
              titleId={TITLE_ID}
              onClose={onClose}
            />

            <div className="space-y-5 p-5">
              <EventDrawerSummary
                node={node}
                eventType={eventType}
                labels={{
                  eventBus: t.dashboardUi.eventBus,
                  eventType: t.dashboardUi.eventType,
                }}
              />
              <EventDrawerMetadata
                timestamp={timestamp}
                durationMs={durationMs}
                labels={{
                  timestamp: t.dashboardUi.timestamp,
                  duration: t.executionsPage.duration,
                }}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium uppercase tracking-wider text-muted-dark">
                  {t.dashboardUi.trafficVolume}
                </label>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${node.volume * 100}%`,
                        backgroundColor: node.color,
                        boxShadow: `0 0 8px ${node.color}40`,
                      }}
                    />
                  </div>
                  <span className="text-sm tabular-nums font-mono text-muted">
                    {Math.round(node.volume * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium uppercase tracking-wider text-muted-dark">
                  {t.common.status}
                </label>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    {isActive && !reducedMotion && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                    )}
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${
                        isActive ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                  </span>
                  <span
                    className={`text-sm font-medium capitalize ${
                      isActive ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {isActive ? t.common.active : t.common.idle}
                  </span>
                </div>
              </div>

              <EventDrawerPayload
                node={node}
                label={t.dashboardUi.samplePayload}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
