"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useDashboardStore } from "@/stores/dashboardStore";
import { usePolling } from "@/hooks/usePolling";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import SignInPrompt from "@/components/dashboard/SignInPrompt";
import AmbientOrbs from "@/components/AmbientOrbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const fetchPersonas = useDashboardStore((s) => s.fetchPersonas);
  const fetchHealth = useDashboardStore((s) => s.fetchHealth);

  // Bootstrap data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void fetchPersonas();
    }
  }, [isAuthenticated, fetchPersonas]);

  // Poll health every 30s
  usePolling(fetchHealth, 30_000, isAuthenticated);

  if (isLoading) return <DashboardSkeleton />;
  if (!isAuthenticated) return <SignInPrompt />;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] relative z-0">
      <AmbientOrbs />
      <DashboardNavbar />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto px-6 py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
