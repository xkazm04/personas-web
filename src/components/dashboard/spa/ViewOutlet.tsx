"use client";

import { Activity, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardErrorBoundary from "@/components/dashboard/DashboardErrorBoundary";
import DashboardScopeBar from "@/components/dashboard/DashboardScopeBar";
import { DASHBOARD_VIEW_IDS, viewIdFromPath, viewTraits, type DashboardViewId } from "./views";
import { viewComponent } from "./viewRegistry";

/** How many views stay alive (state, scroll, fetched data) after you leave them. */
const KEEP_ALIVE = 4;

/**
 * Renders the dashboard view the URL names. Visited views are kept in an
 * `<Activity>` boundary: leaving one hides it and pauses its effects (polling,
 * simulations, timers) but keeps its state, so coming back is instant and
 * lands where you left it. The least recently used view beyond `KEEP_ALIVE`
 * is unmounted.
 */
export default function ViewOutlet({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const current = viewIdFromPath(pathname);
  const traits = current ? viewTraits(current) : null;

  // Most recent last. Updated during render (prev-state pattern), never in an
  // effect, so the new view mounts in the same commit as the URL change.
  const [recent, setRecent] = useState<DashboardViewId[]>(current ? [current] : []);
  if (current && recent[recent.length - 1] !== current) {
    setRecent([...recent.filter((id) => id !== current), current].slice(-KEEP_ALIVE));
  }
  const alive = new Set(recent);

  useViewScroll(current);

  return (
    <div className={traits?.fullBleed ? undefined : "mx-auto max-w-7xl"}>
      {traits?.scoped && <DashboardScopeBar />}
      {/* The route's own output: null for a view, the 404 for anything else. */}
      {children}
      {/* Fixed order, so showing a kept view never moves DOM nodes around. */}
      {DASHBOARD_VIEW_IDS.filter((id) => alive.has(id)).map((id) => {
        const View = viewComponent(id);
        const active = id === current;
        return (
          <Activity key={id} mode={active ? "visible" : "hidden"} name={id}>
            <DashboardErrorBoundary resetKey={active ? "visible" : "hidden"}>
              <View />
            </DashboardErrorBoundary>
          </Activity>
        );
      })}
    </div>
  );
}

/**
 * All views share the window's scroll. Remember each view's position while it
 * is shown and put it back when the view returns (a first visit starts at the
 * top, like a page load).
 */
function useViewScroll(current: DashboardViewId | null) {
  const positions = useRef(new Map<DashboardViewId, number>());

  // One layout effect: the old view's listener is gone before the DOM swap's
  // clamped scroll event is dispatched, so it cannot overwrite the old position.
  useLayoutEffect(() => {
    if (!current) return;
    window.scrollTo(0, positions.current.get(current) ?? 0);
    const save = () => positions.current.set(current, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [current]);
}
