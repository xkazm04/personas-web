"use client";

import type { AnchorHTMLAttributes } from "react";

import { DashLink } from "@/components/dashboard/spa/navigate";
import { preloadView } from "@/components/dashboard/spa/viewRegistry";

/** The executions view with this run's detail open (`?focus=`, allow-listed on arrival). */
export function executionFocusHref(executionId: string): string {
  return `/dashboard/executions?focus=${encodeURIComponent(executionId)}`;
}

/**
 * An SPA link to the exact run it names: the executions view opens that run's
 * detail, and Back returns here. The caller renders it only when it has an id,
 * so it never implies a run it cannot name.
 */
export function ExecutionLink({
  executionId,
  ...rest
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { executionId: string }) {
  return (
    <DashLink {...rest} href={executionFocusHref(executionId)} onPreload={() => preloadView("executions")} />
  );
}
