"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Zap,
  Radio,
  ClipboardCheck,
  Activity,
  Brain,
  Settings,
  Mail,
  HeartPulse,
  Shield,
  Siren,
  Trophy,
} from "lucide-react";
import { useSystemStore } from "@/stores/systemStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useAuthStore } from "@/stores/authStore";
import { MOCK_HEALTH_ALERTS, MOCK_OPEN_INCIDENTS, MOCK_UNREAD_MESSAGES } from "@/lib/mock-dashboard-data";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { useTranslation } from "@/i18n/useTranslation";

export const navItemDefs = [
  { key: "home", labelKey: "overview" as const, icon: LayoutDashboard, href: "/dashboard/home" },
  { key: "agents", labelKey: "agents" as const, icon: Bot, href: "/dashboard/agents" },
  { key: "executions", labelKey: "executions" as const, icon: Zap, href: "/dashboard/executions" },
  { key: "events", labelKey: "events" as const, icon: Radio, href: "/dashboard/events" },
  { key: "reviews", labelKey: "reviews" as const, icon: ClipboardCheck, href: "/dashboard/reviews" },
  { key: "messages", labelKey: "messages" as const, icon: Mail, href: "/dashboard/messages" },
  { key: "observability", labelKey: "observability" as const, icon: Activity, href: "/dashboard/observability" },
  { key: "leaderboard", labelKey: "leaderboard" as const, icon: Trophy, href: "/dashboard/leaderboard" },
  { key: "sla", labelKey: "sla" as const, icon: Shield, href: "/dashboard/sla" },
  { key: "incidents", labelKey: "incidents" as const, icon: Siren, href: "/dashboard/incidents" },
  { key: "health", labelKey: "health" as const, icon: HeartPulse, href: "/dashboard/health" },
  { key: "knowledge", labelKey: "knowledge" as const, icon: Brain, href: "/dashboard/knowledge" },
  { key: "settings", labelKey: "settings" as const, icon: Settings, href: "/dashboard/settings" },
] as const;

export type NavItemDef = (typeof navItemDefs)[number];
export type NavItem = NavItemDef & { label: string };

export function useNavItems(): NavItem[] {
  const { t } = useTranslation();
  return navItemDefs.map((item) => ({
    ...item,
    label: t.dashboard[item.labelKey],
  }));
}

export function useNavState() {
  const pathname = usePathname();
  const health = useSystemStore((s) => s.health);
  const pendingReviewCount = useReviewStore((s) => s.pendingReviewCount);
  // Subscribe to the pre-aggregated count; the nav re-renders only when the
  // count itself changes, not on every unrelated execution-list mutation.
  const activeCount = useExecutionStore((s) => s.activeCount);
  const isDemo = useAuthStore((s) => s.isDemo);

  const isConnected = health?.status === "ok";

  const getActive = (item: NavItem) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard/home" && pathname.startsWith(item.href));
    const isHomeActive =
      item.key === "home" &&
      (pathname === "/dashboard" || pathname === "/dashboard/home");
    return isActive || isHomeActive;
  };

  const getBadge = (item: NavItem) => {
    // Reviews/executions badges come from real stores. Messages/incidents/health
    // have no synced source yet, so their counts are illustrative fixtures —
    // show them ONLY in demo mode; a real tenant must not see fabricated alert
    // counts (they'd act on incidents/health that don't exist in their fleet).
    if (item.key === "reviews" && pendingReviewCount > 0) return pendingReviewCount;
    if (item.key === "executions" && activeCount > 0) return activeCount;
    if (!isDemo) return null;
    if (item.key === "messages" && MOCK_UNREAD_MESSAGES > 0) return MOCK_UNREAD_MESSAGES;
    if (item.key === "incidents" && MOCK_OPEN_INCIDENTS > 0) return MOCK_OPEN_INCIDENTS;
    if (item.key === "health" && MOCK_HEALTH_ALERTS > 0) return MOCK_HEALTH_ALERTS;
    return null;
  };

  return { isConnected, health, getActive, getBadge };
}

export default function DashboardNavigation() {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
}
