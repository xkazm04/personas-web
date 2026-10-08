"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

/**
 * Move inside the dashboard without a route change. Next.js syncs native
 * `pushState` into `usePathname` / `useSearchParams`, so the layout's
 * `ViewOutlet` switches views with no server round trip.
 */
export function navigateDashboard(href: string, { replace = false } = {}) {
  if (typeof window === "undefined") return;
  const current = window.location.pathname + window.location.search;
  if (current === href) return;
  if (replace) window.history.replaceState(null, "", href);
  else window.history.pushState(null, "", href);
}

type DashLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  /** Warm the target view's chunk before the click lands. */
  onPreload?: () => void;
};

/**
 * Click handler for an `<a href>` inside the dashboard: a plain left click
 * becomes a `pushState`; modified clicks (new tab, download) keep the browser
 * default.
 */
export function handleDashLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    (event.currentTarget.target && event.currentTarget.target !== "_self")
  ) {
    return;
  }
  event.preventDefault();
  navigateDashboard(href);
}

/**
 * A real `<a href>` (so middle-click, copy-link and open-in-new-tab keep
 * working) whose plain left click is a `pushState`.
 */
export function DashLink({ href, onClick, onPreload, onMouseEnter, onFocus, ...rest }: DashLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    handleDashLinkClick(event, href);
  };

  return (
    <a
      {...rest}
      href={href}
      onClick={handleClick}
      onMouseEnter={(event) => {
        onPreload?.();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        onPreload?.();
        onFocus?.(event);
      }}
    />
  );
}
