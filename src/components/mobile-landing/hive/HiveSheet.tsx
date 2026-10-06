"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Glyph } from "./Glyphs";

type Phase = "closed" | "opening" | "open" | "closing";

interface HiveSheetProps {
  open: boolean;
  onClose: () => void;
  /** Full-height answer layer (FAQ) rather than a content-height sheet (tool jobs). */
  full?: boolean;
  label: string;
  labelledBy?: string;
  backLabel: string;
  /** Extra content on the right of the bar (the FAQ's "Question 2 of 4"). */
  barEnd?: ReactNode;
  /** Sticky footer below the scrolling body (the FAQ's previous / next). */
  footer?: ReactNode;
  /** The panel's accent colour, for its top glow. */
  tone?: string;
  /** Arrow keys inside the sheet (the FAQ steps with left / right). */
  onArrow?: (dir: 1 | -1) => void;
  still: boolean;
  children: ReactNode;
}

/**
 * The winner's bottom sheet: slides up over a scrim, closes on Back, the scrim, Escape or a drag
 * down on the grab bar, traps Tab, and hands focus back to whatever opened it.
 */
export default function HiveSheet({ open, onClose, full, label, labelledBy, backLabel, barEnd, footer, tone, onArrow, still, children }: HiveSheetProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setPhase(open ? "opening" : "closing");
  }
  const rootRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (phase === "opening") {
      lastFocus.current = document.activeElement as HTMLElement | null;
      const id = setTimeout(() => setPhase("open"), 20);
      return () => clearTimeout(id);
    }
    if (phase === "open") {
      const id = setTimeout(() => rootRef.current?.querySelector<HTMLElement>(".back")?.focus({ preventScroll: true }), 80);
      return () => clearTimeout(id);
    }
    if (phase === "closing") {
      try {
        lastFocus.current?.focus({ preventScroll: true });
      } catch {
        /* the opener is gone: focus stays on the page */
      }
      const id = setTimeout(() => setPhase("closed"), still ? 30 : 560);
      return () => clearTimeout(id);
    }
  }, [phase, still]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (onArrow && e.key === "ArrowRight") onArrow(1);
      else if (onArrow && e.key === "ArrowLeft") onArrow(-1);
      if (e.key !== "Tab") return;
      const f = Array.from(el.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')).filter(
        (x) => !(x as HTMLButtonElement).disabled && x.offsetParent !== null,
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, onArrow]);

  // Drag down to close: the panel follows the finger through --dy, no re-render per move.
  const drag = useRef({ on: false, y0: 0, dy: 0, t0: 0 });
  const onDown = (e: React.PointerEvent<HTMLElement>) => {
    const fromGrab = (e.currentTarget as HTMLElement).hasAttribute("data-grab");
    if (!fromGrab && (e.target as HTMLElement).closest("button")) return;
    drag.current = { on: true, y0: e.clientY, dy: 0, t0: e.timeStamp };
    rootRef.current?.classList.add("dragging");
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety */
    }
  };
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!drag.current.on) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y0);
    rootRef.current?.style.setProperty("--dy", `${drag.current.dy}px`);
  };
  const onUp = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    rootRef.current?.classList.remove("dragging");
    const v = d.dy / Math.max(1, e.timeStamp - d.t0);
    if (d.dy > 110 || (d.dy > 40 && v > 0.5)) onClose();
    rootRef.current?.style.setProperty("--dy", "0px");
  };
  const dragProps = { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp };

  return (
    <div
      ref={rootRef}
      className={`sheet${full ? " full" : ""}${phase === "open" ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      hidden={phase === "closed"}
    >
      <div className="scrim" onClick={onClose} />
      <div className="panel" style={tone ? ({ "--c": tone } as React.CSSProperties) : undefined}>
        <div className="grab" data-grab="" {...dragProps}>
          <i />
        </div>
        <div className="sbar" {...dragProps}>
          <button className="back" type="button" onClick={onClose}>
            <Glyph id="gl-back" size={22} />
            <span>{backLabel}</span>
          </button>
          {barEnd}
        </div>
        {phase !== "closed" && children}
        {footer}
      </div>
    </div>
  );
}
