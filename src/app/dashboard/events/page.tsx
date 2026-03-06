"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Radio, Zap } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import SubscriptionsPanel from "@/components/dashboard/SubscriptionsPanel";
import EventsListPanel from "@/components/dashboard/EventsListPanel";
import { useEventStore } from "@/stores/eventStore";

type PageTab = "events" | "subscriptions";

export default function EventsPage() {
  const events = useEventStore((s) => s.events);
  const subscriptions = useEventStore((s) => s.subscriptions);
  const [pageTab, setPageTab] = useState<PageTab>("events");

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
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <GradientText>Events</GradientText>
          <span className="relative flex h-2.5 w-2.5">
            {alive && (
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-500 ${alive ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-white/20"}`} />
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          Event bus activity across all agents
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
            Events
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
            Subscriptions
            <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums">
              {subscriptions.length}
            </span>
          </button>
        </div>
      </motion.div>

      {pageTab === "subscriptions" ? (
        <motion.div variants={fadeUp}>
          <SubscriptionsPanel />
        </motion.div>
      ) : (
        <EventsListPanel />
      )}
    </motion.div>
  );
}
