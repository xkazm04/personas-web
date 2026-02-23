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
      <body className="flex min-h-screen items-center justify-center bg-[#0a0a12] text-[#e2e8f0]">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-[#94a3b8] mb-6">
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={reset}
            className="rounded-full border border-[#06b6d4]/25 bg-[#06b6d4]/8 px-5 py-2 text-sm font-medium text-[#06b6d4] transition-all hover:border-[#06b6d4]/40 hover:bg-[#06b6d4]/12"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
