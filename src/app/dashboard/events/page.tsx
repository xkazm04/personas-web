"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Radio, Zap, Orbit, Play } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import SubscriptionsPanel from "@/components/dashboard/SubscriptionsPanel";
import EventsListPanel from "@/components/dashboard/EventsListPanel";
import EventBusVisualization from "@/components/dashboard/EventBusVisualization";
import EventBusStats from "@/components/dashboard/EventBusStats";
import EventDetailDrawer from "@/components/dashboard/EventDetailDrawer";
import { useEventStore } from "@/stores/eventStore";
import { useTranslation } from "@/i18n/useTranslation";
import { SWARM_PERSONAS, SWARM_SOURCES, EVENT_TYPES, type SwarmNode } from "@/lib/mock-dashboard-data";

type PageTab = "events" | "subscriptions" | "visualization";

// ── Event type legend colors ──────────────────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  "pull_request.opened": "#06b6d4",
  "message.received": "#a855f7",
  "cron.triggered": "#fbbf24",
  "webhook.incoming": "#34d399",
  "api.request": "#60a5fa",
  "email.received": "#f43f5e",
  "review.requested": "#06b6d4",
  "build.completed": "#34d399",
  "deploy.success": "#a855f7",
  "alert.fired": "#fbbf24",
};

export default function EventsPage() {
  const { t } = useTranslation();
  const events = useEventStore((s) => s.events);
  const subscriptions = useEventStore((s) => s.subscriptions);
  const [pageTab, setPageTab] = useState<PageTab>("events");

  // Visualization state
  const [selectedNode, setSelectedNode] = useState<SwarmNode | null>(null);
  const [burstTrigger, setBurstTrigger] = useState(0);

  // Live activity pulse
  const [alive, setAlive] = useState(false);
  const prevCountRef = useRef(events.length);
  const dimTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const markAlive = useCallback(() => {
    setAlive(true);
    clearTimeout(dimTimerRef.current);
    dimTimerRef.current = setTimeout(() => setAlive(false), 30_000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(dimTimerRef.current);
  }, []);

  useEffect(() => {
    if (events.length > prevCountRef.current) {
      markAlive();
    }
    prevCountRef.current = events.length;
  }, [events.length, markAlive]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative">
      {/* Background illustration */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <Image
          src="/gen/backgrounds/bg-events.png"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover opacity-[0.12]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      </div>

      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <GradientText variant="silver">{t.eventsPage.title}</GradientText>
          <span className="relative flex h-2.5 w-2.5">
            {alive && (
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-500 ${alive ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-white/20"}`} />
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          {t.eventsPage.subtitle}
        </p>
        {/* Page tab switcher */}
        <div className="mt-4 flex overflow-x-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5 w-fit max-w-full scrollbar-hide">
          <button
            onClick={() => setPageTab("events")}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-all ${
              pageTab === "events"
                ? "bg-white/[0.08] text-foreground shadow-sm"
                : "text-muted-dark hover:text-muted"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            {t.eventsPage.tabEvents}
            <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums">
              {events.length}
            </span>
          </button>
          <button
            onClick={() => setPageTab("subscriptions")}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-all ${
              pageTab === "subscriptions"
                ? "bg-white/[0.08] text-foreground shadow-sm"
                : "text-muted-dark hover:text-muted"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            {t.eventsPage.tabSubscriptions}
            <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums">
              {subscriptions.length}
            </span>
          </button>
          <button
            onClick={() => setPageTab("visualization")}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-all ${
              pageTab === "visualization"
                ? "bg-white/[0.08] text-foreground shadow-sm"
                : "text-muted-dark hover:text-muted"
            }`}
          >
            <Orbit className="h-3.5 w-3.5" />
            {t.eventsPage.tabVisualization}
          </button>
        </div>
      </motion.div>

      {pageTab === "subscriptions" ? (
        <motion.div variants={fadeUp}>
          <SubscriptionsPanel />
        </motion.div>
      ) : pageTab === "visualization" ? (
        <motion.div variants={fadeUp} className="space-y-4">
          {/* Stats ticker */}
          <EventBusStats />

          {/* Controls bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setBurstTrigger((n) => n + 1)}
              className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-xs font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20 active:scale-95"
            >
              <Play className="h-3.5 w-3.5" />
              Test Flow
            </button>

            {/* Event type legend */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 ml-auto">
              <span className="text-[10px] uppercase tracking-wider text-muted-dark font-medium">
                Event Types
              </span>
              {EVENT_TYPES.slice(0, 6).map((type) => (
                <span key={type} className="flex items-center gap-1.5 text-[10px] text-muted-dark">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: EVENT_TYPE_COLORS[type] ?? "#666",
                      boxShadow: `0 0 4px ${EVENT_TYPE_COLORS[type] ?? "#666"}40`,
                    }}
                  />
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Main visualization */}
          <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-sm overflow-hidden">
            {/* Subtle radial gradient background */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(6,182,212,0.03) 0%, transparent 70%)",
              }}
            />
            <EventBusVisualization
              className="relative z-10"
              onNodeClick={setSelectedNode}
              triggerBurst={burstTrigger}
            />
          </div>

          {/* Node summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {SWARM_PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedNode(p)}
                className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <span className="text-base">{p.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-foreground truncate">
                    {p.label}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.volume * 100}%`,
                          backgroundColor: p.color,
                        }}
                      />
                    </div>
                    <span className="text-[9px] tabular-nums text-muted-dark">
                      {Math.round(p.volume * 100)}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Event detail drawer */}
          <EventDetailDrawer
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        </motion.div>
      ) : (
        <EventsListPanel />
      )}
    </motion.div>
  );
}
