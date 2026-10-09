"use client";

import { usePathname } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import AuthGuard from "@/components/dashboard/AuthGuard";
import AuthProvider from "@/components/AuthProvider";
import SyncedRealtimeProvider from "@/components/dashboard/SyncedRealtimeProvider";
import ViewOutlet from "@/components/dashboard/spa/ViewOutlet";
import { viewIdFromPath, viewTraits } from "@/components/dashboard/spa/views";
import TourOverlay from "@/components/tour/TourOverlay";
import { TourProvider } from "@/contexts/TourContext";

/**
 * The dashboard is a single-page app: this layout is the app shell, and
 * `ViewOutlet` renders the view the URL names. Navigation inside it is a
 * `pushState` (see `spa/navigate.tsx`), so the shell, the stores and every
 * kept-alive view survive a view switch.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const view = viewIdFromPath(pathname);
  const fullBleed = view ? viewTraits(view).fullBleed : false;

  return (
    <AuthProvider>
      <AuthGuard>
        {/* TourProvider lives here (not on a page) so the guided dashboard tour
            keeps its state and narration across tab navigation. */}
        <TourProvider>
          {/* Live dashboard updates from the desktop sync writer (supabase mode). */}
          <SyncedRealtimeProvider />
          <div className="dash-canvas relative z-0 flex min-h-screen flex-col">
            <DashboardNavbar />
            <div className="flex flex-1">
              <DashboardNavigation />
              <main
                id="main-content"
                className={`min-w-0 flex-1 overflow-auto ${fullBleed ? "pb-20 md:pb-0" : "px-3 py-5 pb-20 sm:px-6 sm:py-8 md:pb-8"}`}
              >
                <ViewOutlet>{children}</ViewOutlet>
              </main>
            </div>
          </div>
          <TourOverlay />
        </TourProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
