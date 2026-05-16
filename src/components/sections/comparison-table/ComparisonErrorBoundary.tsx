"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

function shortCorrelationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

export default class ComparisonErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, errorId: null };

  public static getDerivedStateFromError(): State {
    return { hasError: true, errorId: null };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    const errorId = shortCorrelationId();
    this.setState({ errorId });
    Sentry.setContext("comparisonErrorBoundary", { errorId });
    captureExceptionScrubbed(error, {
      tags: { errorId, scope: "ComparisonErrorBoundary" },
      contexts: {
        react: { componentStack: info.componentStack ?? undefined },
        comparisonErrorBoundary: { errorId },
      },
    });
    console.error(`Comparison render error [${errorId}]:`, error, info);
  }

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[20vh] max-w-xl flex-col items-center justify-center rounded-2xl border border-glass-hover bg-white/[0.02] px-6 py-10 text-center"
      >
        <AlertTriangle className="mb-3 h-6 w-6 text-amber-400" />
        <h2 className="text-lg font-semibold text-foreground">
          Comparison temporarily unavailable
        </h2>
        <p className="mt-2 text-base text-muted">
          We hit a snag rendering the feature matrix.{" "}
          <Link
            href="/features"
            className="text-brand-cyan underline-offset-4 hover:underline"
          >
            Browse features
          </Link>{" "}
          while we sort it out.
        </p>
      </div>
    );
  }
}
