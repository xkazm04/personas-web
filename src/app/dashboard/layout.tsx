"use client";

import { usePathname } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardScopeBar from "@/components/dashboard/DashboardScopeBar";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardErrorBoundary from "@/components/dashboard/DashboardErrorBoundary";
import AuthProvider from "@/components/AuthProvider";
import SyncedRealtimeProvider from "@/components/dashboard/SyncedRealtimeProvider";
import TourOverlay from "@/components/tour/TourOverlay";
import { TourProvider } from "@/contexts/TourContext";

const SCOPED_ROUTE_PREFIXES = [
  "/dashboard/home",
  "/dashboard/agents",
  "/dashboard/executions",
  "/dashboard/events",
  "/dashboard/reviews",
  "/dashboard/observability",
  "/dashboard/knowledge",
  "/dashboard/leaderboard",
  "/dashboard/sla",
  "/dashboard/messages",
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showScope = SCOPED_ROUTE_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return (
    <AuthProvider>
      <AuthGuard>
        {/* TourProvider lives here (not on a page) so the guided dashboard tour
            keeps its state and narration across tab navigation. */}
        <TourProvider>
          {/* Live dashboard updates from the desktop sync writer (supabase mode). */}
          <SyncedRealtimeProvider />
          <div className="flex min-h-screen flex-col bg-[var(--background)] relative z-0">
            <DashboardNavbar />
            <div className="flex flex-1">
              <DashboardNavigation />
              <main id="main-content" className="min-w-0 flex-1 overflow-auto px-3 py-5 pb-20 sm:px-6 sm:py-8 md:pb-8">
                <DashboardErrorBoundary>
                  <div className="mx-auto max-w-7xl">
                    {showScope && <DashboardScopeBar />}
                    {children}
                  </div>
                </DashboardErrorBoundary>
              </main>
            </div>
          </div>
          <TourOverlay />
        </TourProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
