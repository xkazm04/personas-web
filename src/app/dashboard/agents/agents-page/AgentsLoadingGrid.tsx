import GlowCard from "@/components/GlowCard";

function ShimmerBlock({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

export function AgentsLoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <GlowCard key={index} accent="cyan" className="p-5">
          <div className="flex items-center gap-3">
            <ShimmerBlock className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.04]" />
            <div className="flex-1 space-y-1.5">
              <ShimmerBlock className="h-3.5 w-28 bg-white/[0.04]" />
              <ShimmerBlock className="h-2.5 w-40 bg-white/[0.02]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <ShimmerBlock className="h-3 w-14 bg-white/[0.02]" />
            <ShimmerBlock className="h-3 w-16 bg-white/[0.02]" />
            <ShimmerBlock className="h-3 w-18 bg-white/[0.02]" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <ShimmerBlock className="h-7 w-20 rounded-lg bg-white/[0.04]" />
            <ShimmerBlock className="h-7 w-16 rounded-lg bg-white/[0.02]" />
          </div>
        </GlowCard>
      ))}
    </div>
  );
}
