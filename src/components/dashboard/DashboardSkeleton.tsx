"use client";

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/[0.04] ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar skeleton */}
      <div className="hidden w-56 flex-shrink-0 border-r border-glass bg-white/[0.02] p-4 md:block">
        <Shimmer className="mb-8 h-8 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-8">
        <Shimmer className="mb-6 h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-40" />
          ))}
        </div>
      </div>
    </div>
  );
}
