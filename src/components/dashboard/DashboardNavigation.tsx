"use client";

import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { useSystemStore } from "@/stores/systemStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useAuthStore } from "@/stores/authStore";
import { MOCK_HEALTH_ALERTS, MOCK_OPEN_INCIDENTS, MOCK_UNREAD_MESSAGES } from "@/lib/mock-dashboard-data";
import { dashboardHref, viewIdFromPath, type DashboardViewId } from "@/components/dashboard/spa/views";
import { navSections, type NavGroupKey, type NavSectionDef } from "./navRegistry";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { useTranslation } from "@/i18n/useTranslation";

export interface NavLeaf {
  view: DashboardViewId;
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Where clicking the section goes: its view, or its first child. */
  href: string;
  views: readonly DashboardViewId[];
  groups: readonly { key: NavGroupKey; label: string; items: readonly NavLeaf[] }[];
}

function sectionViews(section: NavSectionDef): DashboardViewId[] {
  if (section.groups) return section.groups.flatMap((group) => group.items.map((item) => item.view));
  return section.view ? [section.view] : [];
}

export function useNavSections(): NavSection[] {
  const { t } = useTranslation();
  return navSections.map((section) => {
    const views = sectionViews(section);
    return {
      key: section.key,
      label: t.dashboard[section.labelKey],
      icon: section.icon,
      href: dashboardHref(views[0]),
      views,
      groups: (section.groups ?? []).map((group) => ({
        key: group.key,
        label: t.dashboard.navGroups[group.key],
        items: group.items.map((item) => ({
          view: item.view,
          href: dashboardHref(item.view),
          label: t.dashboard[item.labelKey],
          icon: item.icon,
        })),
      })),
    };
  });
}

/**
 * Every view as one flat list in menu order (the mobile bar has no second
 * level). A single-view section is its own leaf.
 */
export function useNavLeaves(): NavLeaf[] {
  return useNavSections().flatMap((section) =>
    section.groups.length > 0
      ? section.groups.flatMap((group) => group.items)
      : [{ view: section.views[0], href: section.href, label: section.label, icon: section.icon }],
  );
}

export function useNavState() {
  const pathname = usePathname();
  const current = viewIdFromPath(pathname);
  const health = useSystemStore((s) => s.health);
  const pendingReviewCount = useReviewStore((s) => s.pendingReviewCount);
  // Subscribe to the pre-aggregated count; the nav re-renders only when the
  // count itself changes, not on every unrelated execution-list mutation.
  const activeCount = useExecutionStore((s) => s.activeCount);
  const isDemo = useAuthStore((s) => s.isDemo);

  const isConnected = health?.status === "ok";

  const isViewActive = (view: DashboardViewId) => current === view;
  const isSectionActive = (section: NavSection) => current !== null && section.views.includes(current);

  const getBadge = (view: DashboardViewId): number | null => {
    // Reviews/executions badges come from real stores. Messages/incidents/health
    // have no synced source yet, so their counts are illustrative fixtures —
    // show them ONLY in demo mode; a real tenant must not see fabricated alert
    // counts (they'd act on incidents/health that don't exist in their fleet).
    if (view === "reviews" && pendingReviewCount > 0) return pendingReviewCount;
    if (view === "executions" && activeCount > 0) return activeCount;
    if (!isDemo) return null;
    if (view === "messages" && MOCK_UNREAD_MESSAGES > 0) return MOCK_UNREAD_MESSAGES;
    if (view === "incidents" && MOCK_OPEN_INCIDENTS > 0) return MOCK_OPEN_INCIDENTS;
    if (view === "health" && MOCK_HEALTH_ALERTS > 0) return MOCK_HEALTH_ALERTS;
    return null;
  };

  /** A section's rail badge: its own count, or a dot when a child view has one. */
  const getSectionBadge = (section: NavSection): number | "dot" | null => {
    if (section.groups.length === 0) return getBadge(section.views[0]);
    return section.views.some((view) => getBadge(view) !== null) ? "dot" : null;
  };

  return { current, isConnected, health, isViewActive, isSectionActive, getBadge, getSectionBadge };
}

export default function DashboardNavigation() {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
}
