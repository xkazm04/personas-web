import { redirect } from "next/navigation";
import { DEFAULT_DASHBOARD_VIEW, dashboardHref } from "@/components/dashboard/spa/views";

export default function DashboardIndex() {
  redirect(dashboardHref(DEFAULT_DASHBOARD_VIEW));
}
