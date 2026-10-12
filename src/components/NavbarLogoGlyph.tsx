"use client";

import Image from "next/image";
import Link from "next/link";

import { tint } from "@/lib/brand-theme";

/** The mark carries the brand alone - no wordmark beside it. */
const LOGO_SRC = "/imgs/logo-mark.png";

/**
 * Header brand mark: an icon-only home link with a neon glow. Sized to be the
 * dominant element in the top-left corner; it eases down a step once the
 * header turns into the scrolled glass bar.
 */
export default function NavbarLogoGlyph({ scrolled }: { scrolled?: boolean }) {
  // The pulse lives in the navbar on every page - the one piece of motion a
  // visitor can never scroll away from. It used to be a framer loop animating
  // box-shadow: a JS tick plus a repaint on every frame for the life of the
  // page. It is now a CSS opacity crossfade between two static shadows
  // (compositor-only), which the global reduced-motion reset and the hidden-tab
  // pause in globals.css both reach. Under reduced motion it holds the resting
  // shadow.
  return (
    <Link
      href="/"
      aria-label="Personas"
      className={`group relative flex items-center justify-center transition-[width,height] duration-300 focus-ring rounded-2xl ${
        scrolled ? "h-11 w-11" : "h-14 w-14"
      }`}
    >
      {/* Outer ring at rest, and the peak glow fading in and out over it */}
      <div
        className="absolute inset-0 rounded-2xl border border-brand-cyan/30"
        style={{ boxShadow: `0 0 10px ${tint("cyan", 15)}, inset 0 0 8px ${tint("purple", 10)}` }}
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl opacity-0 animate-glow-crossfade"
        style={{ boxShadow: `0 0 20px ${tint("cyan", 30)}, inset 0 0 12px ${tint("purple", 20)}` }}
      />
      <Image
        src={LOGO_SRC}
        alt=""
        width={56}
        height={56}
        className="relative h-full w-full rounded-2xl object-contain p-0.5 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]
                   transition-transform duration-300 group-hover:scale-105"
        priority
      />
    </Link>
  );
}
