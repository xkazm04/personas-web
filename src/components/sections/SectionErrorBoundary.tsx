"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

/**
 * Keeps a failed landing section in its own slot. A lazy section whose chunk
 * fails to load (typically an old chunk after a deploy) would otherwise throw
 * to the route's error.tsx and take the hero and every other section with it
 * (app-shell/lazy-section-loading). The fallback holds `minHeight` and offers a
 * reload that lands back on this section: React caches a rejected lazy import,
 * and a deploy-invalidated chunk only comes back with a fresh page anyway.
 */
export default class SectionErrorBoundary extends Component<
  { anchorId: string; minHeight?: number; children: ReactNode },
  { failed: boolean }
> {
  public state = { failed: false };

  public static getDerivedStateFromError() {
    return { failed: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    // Scrubbed at the call site, as DashboardErrorBoundary does: the component
    // stack can quote paths and prop values.
    captureExceptionScrubbed(error, {
      tags: { scope: "SectionErrorBoundary", section: this.props.anchorId },
      contexts: { react: { componentStack: info.componentStack ?? undefined } },
    });
  }

  public render() {
    if (!this.state.failed) return this.props.children;
    return <SectionLoadFailed anchorId={this.props.anchorId} minHeight={this.props.minHeight} />;
  }
}

function SectionLoadFailed({ anchorId, minHeight }: { anchorId: string; minHeight?: number }) {
  const { t } = useTranslation();
  const reload = () => {
    window.location.hash = anchorId;
    window.location.reload();
  };
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 px-6 text-center" style={{ minHeight }}>
      <span className="flex items-center gap-2 text-base text-muted-dark">
        <AlertTriangle aria-hidden className="h-4 w-4 text-amber-400" />
        {t.common.sectionLoadFailed}
      </span>
      <button
        type="button"
        onClick={reload}
        className="inline-flex items-center gap-1.5 rounded-full border border-glass-hover px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.04] focus-ring"
      >
        <RotateCw aria-hidden className="h-3.5 w-3.5" />
        {t.common.reload}
      </button>
    </div>
  );
}
