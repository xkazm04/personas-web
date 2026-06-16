"use client";

import { Monitor } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * Escape hatch out of the mobile (`/m`) shell. Sets the `prefer-full` cookie
 * that `src/proxy.ts` checks, then hard-navigates to `/dashboard` so the
 * middleware re-runs, sees the cookie, and lets the full desktop UI through.
 * Without this, a phone user who was UA-redirected into `/m` has no UI path to
 * the full dashboard at all.
 */
export default function ViewFullSiteLink() {
  const { t } = useTranslation();

  const handleClick = () => {
    // 1 year; path=/ so it covers every /dashboard route. SameSite=Lax is
    // sufficient for this top-level same-site navigation.
    document.cookie = "prefer-full=1; path=/; max-age=31536000; samesite=lax";
    // Hard navigation (not a soft <Link>) so the middleware re-evaluates the
    // request with the cookie now present and serves the desktop dashboard.
    window.location.href = "/dashboard";
  };

  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={handleClick}
        className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border border-glass bg-white/[0.02] px-4 py-2 text-[13px] font-medium text-muted-dark transition-colors hover:text-foreground active:scale-95"
      >
        <Monitor className="h-4 w-4" />
        {t.common.viewFullSite}
      </button>
    </div>
  );
}
