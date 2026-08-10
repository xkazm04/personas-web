"use client";

import { tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { COPY } from "../copy";
import type { Rect } from "../layout";
import { ModuleReveal } from "./shell";

/**
 * The app's content toolbar: breadcrumb trail on the left, filter chips on
 * the right — the texture every list screen in the product carries, and the
 * cheapest way to make the canvas read as a page rather than a diagram.
 *
 * First thing to arrive, one beat ahead of the route: the workspace waking
 * up, so the first module lands on a page rather than on a void.
 */
export function Toolbar({
  rect,
  shown,
  reduced,
}: {
  rect: Rect;
  shown: boolean;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  const Chevron = c.crumbIcon;
  return (
    <ModuleReveal rect={rect} shown={shown} reduced={reduced} className="flex items-center gap-2">
      <span className={`${ANNOTATION_DIM} normal-case`}>{c.crumbs[0]}</span>
      <Chevron className="h-4 w-4 shrink-0 text-muted-dark" aria-hidden="true" />
      <span className="truncate text-base text-foreground">{c.crumbs[1]}</span>
      <span className="ml-auto hidden items-center gap-1.5 sm:flex">
        {c.filters.map((f) => (
          <FilterChip key={f.label} label={f.label} active={f.active} />
        ))}
      </span>
    </ModuleReveal>
  );
}

/** One filter chip — the active one carries the brand tint. */
function FilterChip({ label, active }: { label: string; active: boolean }) {
  if (!active) {
    return (
      <span className="hidden shrink-0 rounded-full border border-glass px-2.5 py-0.5 text-base text-muted-dark lg:block">
        {label}
      </span>
    );
  }
  return (
    <span
      className="shrink-0 rounded-full border border-brand-cyan/40 px-2.5 py-0.5 text-base text-brand-cyan"
      style={{ backgroundColor: tint("cyan", 12) }}
    >
      {label}
    </span>
  );
}
