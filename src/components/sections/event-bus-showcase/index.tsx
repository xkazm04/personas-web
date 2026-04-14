"use client";

import { useId, useRef, useState, useEffect, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Wand2 } from "lucide-react";
import dynamic from "next/dynamic";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { TerminalPanel } from "@/components/primitives";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { createSnapshot, type QueueTelemetryAdapter } from "@/lib/event-bus-demo";
import { queueRouteSeeds, defaultTelemetryAdapter, variantTabs, type QueueVariant } from "./data";
import SwarmView from "./components/SwarmView";
import LanesView from "./components/LanesView";
import EventBusLegend from "./components/EventBusLegend";

const FlowComposer = dynamic(() => import("@/components/FlowComposer"), {
  ssr: false,
  loading: () => (
    <TerminalPanel className="flex items-center justify-center" bodyClassName="p-12">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: tint("cyan", 30), borderTopColor: BRAND_VAR.cyan }}
      />
    </TerminalPanel>
  ),
});

export default function EventBusShowcase({ telemetryAdapter }: { telemetryAdapter?: QueueTelemetryAdapter }) {
  const uid = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { margin: "200px", once: false });
  const [variant, setVariant] = useState<QueueVariant>("swarm");
  const [snapshot, setSnapshot] = useState(() => createSnapshot("bootstrap", queueRouteSeeds));

  useEffect(() => {
    if (!inView) return;
    const adapter = telemetryAdapter ?? defaultTelemetryAdapter;
    return adapter.subscribe(setSnapshot);
  }, [telemetryAdapter, inView]);

  const [composerOpen, setComposerOpen] = useState(() => {
    if (typeof window !== "undefined") return window.location.hash.startsWith("#flow=");
    return false;
  });

  const laneMetrics = useMemo(
    () =>
      snapshot.routes.map((route) => ({
        id: route.id,
        producer: route.producerLabel,
        consumer: route.consumerLabel,
        queueDepth: route.queueDepth,
        latencyMs: route.latencyMs,
        eps: route.throughputEps,
        color: route.color,
      })),
    [snapshot.routes],
  );

  const averageLatency = useMemo(() => {
    if (!snapshot.routes.length) return 0;
    const total = snapshot.routes.reduce((sum, route) => sum + route.latencyMs, 0);
    return Math.round(total / snapshot.routes.length);
  }, [snapshot.routes]);

  return (
    <SectionWrapper id="event-bus">
      <SectionIntro
        heading="Agents that"
        gradient="talk to each other"
        description="Your agents share information through a central message hub. When one agent finishes a task, it can automatically trigger the next — no manual steps needed."
        descriptionMaxWidth="max-w-3xl"
      />
      {!composerOpen && (
        <motion.div variants={fadeUp} className="-mt-4 flex justify-center">
          <button
            onClick={() => setComposerOpen(true)}
            className="group flex items-center gap-2 rounded-full border px-6 py-2.5 text-base font-medium transition-all"
            style={{
              borderColor: tint("cyan", 25),
              backgroundColor: tint("cyan", 10),
              color: BRAND_VAR.cyan,
            }}
          >
            <Wand2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
            Try it yourself — build a flow
          </button>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="relative mx-auto mt-16 max-w-3xl">
        <AnimatePresence mode="wait">
          {composerOpen ? (
            <motion.div
              key="composer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FlowComposer
                onClose={() => {
                  setComposerOpen(false);
                  window.history.replaceState(null, "", window.location.pathname);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="showcase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                {variantTabs.map((tab) => {
                  const isActive = variant === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setVariant(tab.id)}
                      className="group rounded-full border px-4 py-2 text-base font-mono uppercase tracking-wider transition-all duration-300"
                      style={
                        isActive
                          ? {
                              borderColor: tint("cyan", 35),
                              backgroundColor: tint("cyan", 12),
                              color: BRAND_VAR.cyan,
                              boxShadow: `0 0 18px ${tint("cyan", 14)}`,
                            }
                          : undefined
                      }
                    >
                      <span>{tab.label}</span>
                      <span className="ml-2 text-base normal-case tracking-normal text-muted group-hover:text-foreground/80">
                        {tab.hint}
                      </span>
                    </button>
                  );
                })}
              </div>

              <TerminalPanel
                ref={containerRef}
                shadow="none"
                className="shadow-[0_0_80px_rgba(0,0,0,0.25)] animate-breathe-glow"
                bodyClassName="p-4 md:p-6"
              >
                <TerminalChrome
                  title="message hub — live"
                  info={`${snapshot.source} stream · ${snapshot.totalInFlight} being sent · ${snapshot.totalBacklog} waiting`}
                  className="mb-4 pb-3"
                />

                {variant === "swarm" && <SwarmView uid={uid} />}
                {variant === "lanes" && <LanesView laneMetrics={laneMetrics} inView={inView} />}
              </TerminalPanel>

              <div
                className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-2xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${tint("cyan", 4)}, transparent, ${tint("purple", 4)})`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!composerOpen && <EventBusLegend averageLatency={averageLatency} />}
    </SectionWrapper>
  );
}
