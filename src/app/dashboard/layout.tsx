"use client";

import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardErrorBoundary from "@/components/dashboard/DashboardErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-[var(--background)] relative z-0">
        <DashboardNavbar />
        <div className="flex flex-1">
          <DashboardNavigation />
          <main className="flex-1 overflow-auto px-4 py-6 pb-20 sm:px-6 sm:py-8 md:pb-8">
            <DashboardErrorBoundary>
              <div className="mx-auto max-w-7xl">{children}</div>
            </DashboardErrorBoundary>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
