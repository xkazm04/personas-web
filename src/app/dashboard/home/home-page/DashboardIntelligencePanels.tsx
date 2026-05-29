"use client";

import GlowCard from "@/components/GlowCard";
import HealthDigestPanel from "@/components/dashboard/HealthDigestPanel";
import MemoryActionsPanel from "@/components/dashboard/MemoryActionsPanel";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import { useAuthStore } from "@/stores/authStore";

export function DashboardIntelligencePanels({ ready }: { ready: boolean }) {
  const isDemo = useAuthStore((s) => s.isDemo);

  // The Health Digest + Memory Actions panels are illustrative-only: neither
  // has a faithful synced source in cloud-sync mode. Show them in demo; in real
  // mode render nothing once the (demo) skeleton phase would have resolved.
  if (ready && !isDemo) return null;

  return ready ? (
    <>
      <GlowCard accent="emerald" className="p-5">
        <HealthDigestPanel />
      </GlowCard>
      <GlowCard accent="purple" className="p-5">
        <MemoryActionsPanel />
      </GlowCard>
    </>
  ) : (
    <>
      <SkeletonCard lines={5} />
      <SkeletonCard lines={4} />
    </>
  );
}
