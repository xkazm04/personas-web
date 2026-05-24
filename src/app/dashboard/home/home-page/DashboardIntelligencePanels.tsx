import GlowCard from "@/components/GlowCard";
import HealthDigestPanel from "@/components/dashboard/HealthDigestPanel";
import MemoryActionsPanel from "@/components/dashboard/MemoryActionsPanel";
import SkeletonCard from "@/components/dashboard/SkeletonCard";

export function DashboardIntelligencePanels({ ready }: { ready: boolean }) {
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
