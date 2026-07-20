"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Forward any query (notably `?tour=1` from the /features bridge) so the
    // dashboard's TourLauncher can autostart on arrival.
    const search = window.location.search;
    const target = `/dashboard/home${search}`;
    try {
      enterDemo();
      router.replace(target);
    } catch {
      setFailed(true);
      return;
    }
    // Escape hatch: if the redirect never lands (chunk-load error, dashboard
    // route error boundary), surface a manual link instead of an eternal spinner.
    const timeout = window.setTimeout(() => setFailed(true), 5000);
    return () => window.clearTimeout(timeout);
  }, [enterDemo, router]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-[var(--background)]"
    >
      {failed ? (
        <div role="alert" className="flex flex-col items-center gap-4 px-6 text-center">
          <span className="text-base text-muted">
            The demo could not start automatically.
          </span>
          <Link
            href="/dashboard/home"
            className="rounded-lg border border-glass px-4 py-2 text-base text-brand-cyan hover:bg-white/5"
          >
            Open the demo
          </Link>
        </div>
      ) : (
        <div role="status" className="flex items-center gap-3 text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" aria-hidden="true" />
          <span className="text-base">{t.common.loading}</span>
        </div>
      )}
    </main>
  );
}
