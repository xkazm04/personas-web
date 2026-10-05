"use client";

import type { ReactNode, RefObject } from "react";
import { useAnimationPauseRegister } from "@/hooks/useAnimationPause";
import LabTourScope from "./LabTourScope";

/**
 * The hero's stage frame: exactly one viewport (stage.css `data-stage-hero`
 * holds it at 100svh below the navbar), clipped, paint-contained, and
 * registered with the page's off-screen animation pause.
 */
export default function HeroShell({
  sectionRef,
  children,
  className = "",
}: {
  sectionRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}) {
  useAnimationPauseRegister(sectionRef);
  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      data-stage-hero
      data-animate-when-visible
      suppressHydrationWarning
      className={`relative flex min-h-screen items-center overflow-hidden bg-background px-5 sm:px-8 ${className}`}
      style={{ contain: "layout style paint" }}
    >
      <LabTourScope>{children}</LabTourScope>
    </section>
  );
}
