"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Wand2 } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { useLoopGate } from "@/hooks/useLoopGate";
import { useIsMobile } from "@/hooks/useIsMobile";
import { createSnapshot } from "@/lib/event-bus-demo";
import { useTranslation } from "@/i18n/useTranslation";
import { useStepper } from "./shared/useStepper";
import { ROUTE_SEEDS, hubTelemetry } from "./telemetry";
import Tabs, { type HubVariant } from "./Tabs";
import HubView from "./HubView";
import LanesView from "./LanesView";
import PhoneHub from "./PhoneHub";
import LanesPhone from "./LanesPhone";

const FlowComposer = dynamic(() => import("@/components/FlowComposer"), { ssr: false });
const RELAY_MS = ROUTE_SEEDS.map(() => 3600);

// The composer's #flow= deep link, read as the external store it is.
const subscribeToHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readFlowHash = () => window.location.hash.startsWith("#flow=");
const noHashOnServer = () => false;

/**
 * Events - V1, the direct successor. Same mechanism as the live section (a hub
 * with the swarm around it, a Live / Performance switch, live hub figures from
 * the telemetry adapter, the build-a-flow composer), drawn as a lit scene: the
 * tools on a perspective orbit, a glass hub ringed by turning light, and each
 * route relayed in turn - into the hub, out to the tool that needs it.
 * Phones (under 48rem; the section is ssr: false) get the eight-tool hub and
 * stacked lane cards, and no composer: it is a drag-and-wire canvas.
 */
export default function EventsV1() {
  const t = useTranslation().t.howSections.events;
  const uid = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const { run, tick } = useLoopGate(stageRef, { rootMargin: "200px" });
  const [variant, setVariant] = useState<HubVariant>("swarm");
  const [snapshot, setSnapshot] = useState(() => createSnapshot("bootstrap", ROUTE_SEEDS));
  const step = useStepper(run && variant === "swarm", RELAY_MS);
  const phone = useIsMobile();

  useEffect(() => {
    if (!tick) return;
    return hubTelemetry.subscribe(setSnapshot);
  }, [tick]);

  const deepLinked = useSyncExternalStore(subscribeToHash, readFlowHash, noHashOnServer);
  const [composerToggle, setComposerToggle] = useState<boolean | null>(null);
  const composerOpen = !phone && (composerToggle ?? deepLinked);

  const typical = useMemo(() => {
    const r = snapshot.routes;
    return r.length ? Math.round(r.reduce((s, x) => s + x.latencyMs, 0) / r.length) : 0;
  }, [snapshot.routes]);

  const stats: [number | string, string][] = [
    [snapshot.totalInFlight, t.v1.inFlight],
    [snapshot.totalBacklog, t.v1.waiting],
    [`${typical} ms`, t.v1.typical],
  ];

  return (
    <SectionWrapper fit="fill" id="event-bus">
      <SectionIntro heading={t.heading} gradient={t.headingGradient} description={t.description} descriptionMaxWidth="max-w-3xl" />
      <motion.div variants={fadeUp} data-stage-slot className="flex w-full flex-col gap-[clamp(0.5rem,2cqh,1.5rem)]">
        <div data-stage-zoom className="flex flex-wrap items-center justify-between gap-3">
          <Tabs uid={uid} value={variant} onChange={setVariant} />
          {!phone && (
            <button
              type="button"
              onClick={() => {
                const next = !composerOpen;
                setComposerToggle(next);
                if (!next) window.history.replaceState(null, "", window.location.pathname + window.location.search);
              }}
              aria-expanded={composerOpen}
              className="group flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-5 py-2.5 text-base font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/15"
            >
              <Wand2 className="h-4 w-4 transition-transform group-hover:rotate-12" aria-hidden="true" />
              {t.v1.buildFlow}
            </button>
          )}
        </div>

        <div ref={stageRef} className="relative min-h-0 flex-1 stage:[container-type:size]">
          {composerOpen ? (
            <div className="h-full overflow-y-auto">
              <FlowComposer
                onClose={() => {
                  setComposerToggle(false);
                  window.history.replaceState(null, "", window.location.pathname + window.location.search);
                }}
              />
            </div>
          ) : (
            <div role="tabpanel" id={`${uid}-panel-${variant}`} aria-labelledby={`${uid}-tab-${variant}`} className="flex h-full items-center overflow-x-auto stage:overflow-visible">
              {phone ? (
                variant === "swarm" ? <PhoneHub uid={uid} step={step} run={run} /> : <LanesPhone routes={snapshot.routes} run={run} />
              ) : variant === "swarm" ? (
                <HubView uid={uid} step={step} run={run} />
              ) : (
                <LanesView routes={snapshot.routes} run={run} />
              )}
            </div>
          )}
        </div>
        <div data-stage-zoom className="flex justify-center">
          <dl className="flex flex-wrap items-center justify-center gap-5 font-mono">
            <div className="h-2 w-2 animate-pulse rounded-full bg-brand-emerald shadow-[0_0_10px_var(--brand-emerald)]" aria-hidden="true" />
            {stats.map(([value, label]) => (
              <div key={label} className="flex flex-row-reverse items-baseline gap-1.5">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="text-lg font-semibold tabular-nums text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
