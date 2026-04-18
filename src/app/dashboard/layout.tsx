"use client";

import { usePathname } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import DashboardScopeBar from "@/components/dashboard/DashboardScopeBar";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardErrorBoundary from "@/components/dashboard/DashboardErrorBoundary";

const SCOPED_ROUTE_PREFIXES = [
  "/dashboard/home",
  "/dashboard/agents",
  "/dashboard/executions",
  "/dashboard/events",
  "/dashboard/reviews",
  "/dashboard/observability",
  "/dashboard/usage",
  "/dashboard/knowledge",
  "/dashboard/memories",
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
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-[var(--background)] relative z-0">
        <DashboardNavbar />
        <div className="flex flex-1">
          <DashboardNavigation />
          <main className="flex-1 overflow-auto px-4 py-6 pb-20 sm:px-6 sm:py-8 md:pb-8">
            <DashboardErrorBoundary>
              <div className="mx-auto max-w-7xl">
                {showScope && <DashboardScopeBar />}
                {children}
              </div>
            </DashboardErrorBoundary>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
