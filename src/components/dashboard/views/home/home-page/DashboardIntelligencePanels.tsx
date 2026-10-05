"use client";

import GlowCard from "@/components/GlowCard";
import HealthDigestPanel from "@/components/dashboard/HealthDigestPanel";
import MemoryActionsPanel from "@/components/dashboard/MemoryActionsPanel";
import { useAuthStore } from "@/stores/authStore";

/**
 * Health Digest + Memory Actions, the instruments bay's opening pair.
 *
 * Both panels are illustrative-only: neither has a faithful synced source in
 * cloud-sync mode, so they render in demo and nothing at all otherwise. There
 * is no skeleton phase — the panels have no fetch of their own, and the whole
 * bay is already deferred behind `LazyMount`. (A `ready` prop used to gate a
 * `SkeletonCard` branch here, but every call site passed `ready` literally
 * true, so the branch could never render.)
 */
export function DashboardIntelligencePanels() {
  const isDemo = useAuthStore((s) => s.isDemo);
  if (!isDemo) return null;

  return (
    <>
      <GlowCard accent="emerald" className="p-5">
        <HealthDigestPanel />
      </GlowCard>
      <GlowCard accent="purple" className="p-5">
        <MemoryActionsPanel />
      </GlowCard>
    </>
  );
}
