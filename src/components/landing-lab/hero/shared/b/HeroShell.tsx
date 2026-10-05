"use client";

import { useRef, type ReactNode } from "react";
import { useAnimationPauseRegister } from "@/hooks/useAnimationPause";

/**
 * The hero section element for seat B's variants: the same contract as the
 * live HeroClient (`data-stage-hero` = exactly one viewport under the navbar,
 * off-screen CSS animations paused through the pause registry), opaque so it
 * owns the viewport over the page's ambient layer.
 */
export default function HeroShell({
  labelledBy,
  className = "",
  children,
}: {
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useAnimationPauseRegister(ref);
  return (
    <section
      ref={ref}
      aria-labelledby={labelledBy}
      data-stage-hero
      data-animate-when-visible
      // The pause registry toggles a class on this element after hydration.
      suppressHydrationWarning
      className={`relative isolate z-10 flex min-h-screen flex-col overflow-hidden bg-background ${className}`}
      style={{ contain: "layout style paint" }}
    >
      {children}
    </section>
  );
}
