"use client";

import { MotionConfig } from "framer-motion";

import AuthProvider from "@/components/AuthProvider";
import AuthGuard from "@/components/dashboard/AuthGuard";
import MobileShell from "@/components/mobile/MobileShell";
import MobileTabBar from "@/components/mobile/MobileTabBar";

/**
 * Dedicated mobile shell (Approach B). Reuses the dashboard's auth + data layer
 * but renders a purpose-built 3-tab touch UI with none of the desktop chrome
 * (no DashboardNavbar / DashboardScopeBar / DesktopSidebar).
 *
 * `MotionConfig reducedMotion="user"` makes every framer-motion animation below
 * honor prefers-reduced-motion (transform/layout disabled, opacity kept) without
 * per-component guards. Tap-highlight is suppressed for a native feel.
 */
export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <MotionConfig reducedMotion="user">
          <div
            className="relative min-h-svh bg-[var(--background)] text-foreground"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <MobileShell>{children}</MobileShell>
            <MobileTabBar />
          </div>
        </MotionConfig>
      </AuthGuard>
    </AuthProvider>
  );
}
