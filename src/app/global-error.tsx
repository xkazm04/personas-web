"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-[#94a3b8] mb-6">
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={reset}
            className="rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-4 py-2 text-sm font-medium text-brand-cyan transition-all hover:border-brand-cyan/40 hover:bg-brand-cyan/12"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
