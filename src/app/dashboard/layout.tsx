"use client";

import { usePathname } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardNavigation, { navItemDefs } from "@/components/dashboard/DashboardNavigation";
import DashboardScopeBar from "@/components/dashboard/DashboardScopeBar";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardErrorBoundary from "@/components/dashboard/DashboardErrorBoundary";
import AuthProvider from "@/components/AuthProvider";
import SyncedRealtimeProvider from "@/components/dashboard/SyncedRealtimeProvider";
import TourOverlay from "@/components/tour/TourOverlay";
import { TourProvider } from "@/contexts/TourContext";

// Derived from the single nav registry so the scope bar can never drift from
// the routes: a nav entry is "scoped" iff its data respects dashboardFilterStore.
const SCOPED_ROUTE_PREFIXES = navItemDefs
  .filter((item) => item.scoped)
  .map((item) => item.href);

// Routes whose page owns the whole content area edge to edge (no max width, no
// page padding): the fleet playground's stage is sized to the viewport.
const FULL_BLEED_PREFIXES = ["/dashboard/playground"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const matches = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
  const showScope = SCOPED_ROUTE_PREFIXES.some(matches);
  const fullBleed = FULL_BLEED_PREFIXES.some(matches);

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
              <main
                id="main-content"
                className={`min-w-0 flex-1 overflow-auto ${fullBleed ? "pb-20 md:pb-0" : "px-3 py-5 pb-20 sm:px-6 sm:py-8 md:pb-8"}`}
              >
                <DashboardErrorBoundary resetKey={pathname}>
                  <div className={fullBleed ? undefined : "mx-auto max-w-7xl"}>
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
