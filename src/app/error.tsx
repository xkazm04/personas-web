"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

export default function RouteError({
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
    <>
      <Navbar />
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/5 px-4 py-1.5 text-base font-mono font-medium text-red-400/80">
            Error
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Something went wrong
          </h1>

          <p className="mt-4 text-base text-muted leading-relaxed">
            {error.message || "An unexpected error occurred while loading this page."}
          </p>

          {error.digest && (
            <p className="mt-2 font-mono text-sm text-muted-dark">
              Reference: {error.digest}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-6 py-2.5 text-base font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/20"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-glass-hover bg-white/[0.03] px-6 py-2.5 text-base font-medium text-muted transition-colors hover:text-foreground hover:bg-white/[0.05]"
            >
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
