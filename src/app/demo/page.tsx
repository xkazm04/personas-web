"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import { useAuthStore } from "@/stores/authStore";

/**
 * Standalone public demo entry.
 *
 * Activates demo mode (in-memory mock data, no sign-in) and redirects into the
 * dashboard. This lets the real cloud app at `/dashboard` and the demo coexist
 * in a single production build without an env flag: real visitors sign in at
 * `/dashboard`, while `/demo` is the shareable, always-on demo experience.
 *
 * `enterDemo()` marks the auth store initialized, so the dashboard's
 * AuthProvider won't re-run real auth and clobber the demo session.
 */
export default function DemoEntryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const enterDemo = useAuthStore((s) => s.enterDemo);

  useEffect(() => {
    enterDemo();
    // Forward any query (notably `?tour=1` from the /features bridge) so the
    // dashboard's TourLauncher can autostart on arrival.
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`/dashboard/home${search}`);
  }, [enterDemo, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="flex items-center gap-3 text-muted">
        <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" aria-hidden="true" />
        <span className="text-base">{t.common.loading}</span>
      </div>
    </div>
  );
}
