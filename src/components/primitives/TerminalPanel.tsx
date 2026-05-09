"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";

interface TerminalPanelProps {
  /** Header content (title bar). Use TerminalChrome for the classic mac-traffic-light look. */
  header?: ReactNode;
  /** Footer content (status bar). */
  footer?: ReactNode;
  /** Body content. */
  children: ReactNode;
  /** Extra Tailwind classes for the wrapper. */
  className?: string;
  /** Extra Tailwind classes for the body container. */
  bodyClassName?: string;
  /** Inline style overrides for the wrapper. */
  style?: CSSProperties;
  /**
   * Drop-shadow weight applied to the wrapper.
   * - "none" — no shadow
   * - "soft" — `shadow-[0_0_60px_rgba(0,0,0,0.3)]` (default)
   * - "hero" — `shadow-[0_0_80px_rgba(0,0,0,0.4)]` (used by playground/showcase panels)
   */
  shadow?: "none" | "soft" | "hero";
  /**
   * Background opacity. Most panels use 50; some content cards (security
   * page, download FAQ, comparison table) use a slightly dimmer 40.
   */
  bg?: 40 | 50;
}

const SHADOW_CLASS = {
  none: "",
  soft: "shadow-[0_0_60px_rgba(0,0,0,0.3)]",
  hero: "shadow-[0_0_80px_rgba(0,0,0,0.4)]",
} as const;

const BG_CLASS = {
  40: "bg-black/40",
  50: "bg-black/50",
} as const;

/**
 * TerminalPanel — the dark glass panel shell used by playground simulations,
 * observability dashboards, agent activity feeds, and most prototype panels.
 *
 * Replaces the repeated `rounded-2xl border bg-black/{40,50} backdrop-blur-xl
 * overflow-hidden` pattern (with optional header + footer slots) that
 * appeared in 12+ components.
 *
 * @example
 *   <TerminalPanel
 *     header={<TerminalChrome title="event-bus" status="live" />}
 *     footer={<span className="text-base text-muted-dark">12 events</span>}
 *   >
 *     {events.map(e => <Row key={e.id} {...e} />)}
 *   </TerminalPanel>
 *
 *   // Header-less content card
 *   <TerminalPanel bg={40} bodyClassName="p-6">…</TerminalPanel>
 */
const TerminalPanel = forwardRef<HTMLDivElement, TerminalPanelProps>(
  function TerminalPanel(
    {
      header,
      footer,
      children,
      className = "",
      bodyClassName = "",
      style,
      shadow = "soft",
      bg = 50,
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={`rounded-2xl border border-glass-hover backdrop-blur-xl overflow-hidden ${BG_CLASS[bg]} ${SHADOW_CLASS[shadow]} ${className}`}
        style={style}
      >
        {header && (
          <div className="border-b border-glass">{header}</div>
        )}
        <div className={bodyClassName}>{children}</div>
        {footer && (
          <div className="flex items-center justify-between border-t border-glass px-4 py-2.5 sm:px-5 bg-white/[0.01]">
            {footer}
          </div>
        )}
      </div>
    );
  },
);

export default TerminalPanel;
