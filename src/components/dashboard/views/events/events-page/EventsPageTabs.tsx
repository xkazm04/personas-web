import { useCallback, useRef } from "react";
import { GanttChart, Orbit, Radio, Zap } from "lucide-react";

export type PageTab = "events" | "subscriptions" | "visualization" | "swimlane";

const TAB_ICONS = {
  events: Radio,
  subscriptions: Zap,
  visualization: Orbit,
  swimlane: GanttChart,
} satisfies Record<PageTab, typeof Radio>;

const TAB_ORDER: PageTab[] = ["events", "subscriptions", "visualization", "swimlane"];

export function EventsPageTabs({
  activeTab,
  eventCount,
  subscriptionCount,
  listLabel,
  labels,
  onTabChange,
}: {
  activeTab: PageTab;
  eventCount: number;
  subscriptionCount: number;
  listLabel: string;
  labels: Record<PageTab, string>;
  onTabChange: (tab: PageTab) => void;
}) {
  const tabs: { key: PageTab; count?: number }[] = [
    { key: "events", count: eventCount },
    { key: "subscriptions", count: subscriptionCount },
    { key: "visualization" },
    { key: "swimlane" },
  ];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Roving-tabindex keyboard navigation: Left/Right wrap, Home/End jump.
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const count = TAB_ORDER.length;
      const current = TAB_ORDER.indexOf(activeTab);
      let nextIndex: number | null = null;
      if (e.key === "ArrowRight") nextIndex = (current + 1) % count;
      else if (e.key === "ArrowLeft") nextIndex = (current - 1 + count) % count;
      else if (e.key === "Home") nextIndex = 0;
      else if (e.key === "End") nextIndex = count - 1;
      if (nextIndex === null) return;
      e.preventDefault();
      onTabChange(TAB_ORDER[nextIndex]);
      tabRefs.current[nextIndex]?.focus();
    },
    [activeTab, onTabChange],
  );

  return (
    <div
      role="tablist"
      aria-label={listLabel}
      aria-orientation="horizontal"
      className="mt-4 flex overflow-x-auto rounded-lg border border-glass bg-white/[0.02] p-0.5 w-fit max-w-full scrollbar-hide"
    >
      {tabs.map((tab, index) => {
        const Icon = TAB_ICONS[tab.key];
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.key)}
            onKeyDown={handleTabKeyDown}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all focus-ring focus-visible:ring-offset-0 ${
              isActive
                ? "bg-white/[0.08] text-foreground shadow-sm"
                : "text-muted-dark hover:text-muted"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {labels[tab.key]}
            {tab.count !== undefined && (
              <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-sm tabular-nums">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
