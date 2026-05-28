import AuthProvider from "@/components/AuthProvider";
import AuthGuard from "@/components/dashboard/AuthGuard";
import MobileShell from "@/components/mobile/MobileShell";
import MobileTabBar from "@/components/mobile/MobileTabBar";

/**
 * Dedicated mobile shell (Approach B). Reuses the dashboard's auth + data layer
 * but renders a purpose-built 3-tab touch UI with none of the desktop chrome
 * (no DashboardNavbar / DashboardScopeBar / DesktopSidebar).
 */
export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="relative min-h-[100dvh] bg-[var(--background)] text-foreground">
          <MobileShell>{children}</MobileShell>
          <MobileTabBar />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
