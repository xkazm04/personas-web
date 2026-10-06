"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useNavSections, useNavState, type NavSection } from "./DashboardNavigation";
import { DashLink } from "@/components/dashboard/spa/navigate";
import { preloadView } from "@/components/dashboard/spa/viewRegistry";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * The desktop dashboard menu, two levels like the desktop app: a rail of
 * sections (icon over label), and beside it, for a section with children, a
 * panel of captioned groups. Personas, the main view, gets the full width.
 */
export default function DesktopSidebar() {
  const sections = useNavSections();
  const nav = useNavState();
  const open = sections.find((section) => section.groups.length > 0 && nav.isSectionActive(section));

  return (
    <div className="sticky top-[4.25rem] hidden h-[calc(100dvh-4.25rem)] flex-shrink-0 md:flex">
      <SectionRail sections={sections} nav={nav} />
      {open && <SectionPanel section={open} nav={nav} />}
    </div>
  );
}

type NavState = ReturnType<typeof useNavState>;

function SectionRail({ sections, nav }: { sections: NavSection[]; nav: NavState }) {
  const { t } = useTranslation();

  return (
    <aside className="flex w-[5.5rem] flex-col border-r border-glass bg-white/[0.02]">
      <nav aria-label={t.dashboard.navSectionsLabel} className="flex-1 overflow-y-auto px-1.5 py-3">
        <ul className="space-y-1">
          {sections.map((section) => {
            const active = nav.isSectionActive(section);
            const Icon = section.icon;
            const badge = nav.getSectionBadge(section);
            return (
              <li key={section.key}>
                <DashLink
                  href={section.href}
                  onPreload={() => preloadView(section.views[0])}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                    active
                      ? "bg-brand-cyan/10 text-brand-cyan"
                      : "text-muted-dark hover:bg-white/[0.04] hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-brand-cyan" />
                  )}
                  <Icon aria-hidden className="h-5 w-5" />
                  <span className="w-full truncate text-xs font-semibold leading-tight">{section.label}</span>
                  {badge === "dot" && (
                    <span aria-hidden className="absolute right-3 top-2 h-2 w-2 rounded-full bg-brand-amber" />
                  )}
                  {typeof badge === "number" && (
                    <span className="absolute right-1.5 top-1 rounded-full bg-brand-cyan/20 px-1.5 text-xs font-semibold tabular-nums text-brand-cyan">
                      {badge}
                    </span>
                  )}
                </DashLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <ConnectionChip nav={nav} />
    </aside>
  );
}

function SectionPanel({ section, nav }: { section: NavSection; nav: NavState }) {
  return (
    <aside className="flex w-56 flex-col border-r border-glass bg-white/[0.015]">
      <div className="flex h-12 flex-none items-center border-b border-glass px-4">
        <h2 className="text-sm font-semibold text-foreground">{section.label}</h2>
      </div>
      <nav aria-label={section.label} className="flex-1 overflow-y-auto px-2 py-3">
        {section.groups.map((group, index) => (
          <div key={group.key} className={index > 0 ? "mt-3 border-t border-glass pt-3" : undefined}>
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-dark">
              {group.label}
            </p>
            <ul className="ml-3 space-y-0.5 border-l border-glass pl-2">
              {group.items.map((item) => {
                const active = nav.isViewActive(item.view);
                const Icon = item.icon;
                const badge = nav.getBadge(item.view);
                return (
                  <li key={item.view}>
                    <DashLink
                      href={item.href}
                      onPreload={() => preloadView(item.view)}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                        active
                          ? "bg-brand-cyan/10 font-medium text-foreground"
                          : "text-muted hover:bg-white/[0.04] hover:text-foreground"
                      }`}
                    >
                      <Icon
                        aria-hidden
                        className={`h-3.5 w-3.5 flex-shrink-0 ${active ? "text-brand-cyan" : "text-muted-dark group-hover:text-muted"}`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge !== null && (
                        <span
                          className={`rounded-full px-1.5 text-xs font-medium tabular-nums ${
                            active ? "bg-brand-cyan/20 text-brand-cyan" : "bg-white/[0.08] text-muted"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </DashLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function ConnectionChip({ nav }: { nav: NavState }) {
  const { t } = useTranslation();
  const { isConnected, health } = nav;
  const label = isConnected ? t.dashboardUi.connected : t.dashboardUi.disconnected;
  const workers = isConnected && health?.workers ? `${health.workers.total}${t.dashboardUi.weekAbbr}` : null;

  return (
    <div
      className="flex flex-col items-center gap-1 border-t border-glass px-1 py-3 text-xs"
      title={workers ? `${label} · ${workers}` : label}
    >
      {isConnected ? (
        <span className="relative flex h-3.5 w-3.5 items-center justify-center">
          <Wifi aria-hidden className="absolute h-3.5 w-3.5 text-emerald-400" />
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40 motion-reduce:hidden" />
        </span>
      ) : (
        <WifiOff aria-hidden className="h-3.5 w-3.5 text-red-400" />
      )}
      <span className={`w-full truncate text-center ${isConnected ? "text-emerald-400" : "text-red-400"}`}>{label}</span>
      {workers && <span className="tabular-nums text-muted-dark">{workers}</span>}
    </div>
  );
}
