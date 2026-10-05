import { DASHBOARD_VIEW_IDS } from "@/components/dashboard/spa/views";

// One prerendered entry per dashboard view, so a deep link or a reload is a
// static file. Anything else under /dashboard/ is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return DASHBOARD_VIEW_IDS.map((view) => ({ view }));
}

/**
 * Renders nothing: the dashboard is a single-page app and the layout's
 * `ViewOutlet` draws the view from the URL. Keeping the view out of the page
 * is what lets a `pushState` switch views without a route change.
 */
export default function DashboardViewEntry() {
  return null;
}
