"use client";

import { useEffect, useRef } from "react";
import type { CardData } from "./cards";
import s from "./clock.module.css";

export interface OpenCard {
  data: CardData;
  /** Where the scene grows from, in column px. */
  ox: number;
  oy: number;
}

interface CardLayerProps {
  /** The last opened card; it stays rendered while the scene closes. */
  card: OpenCard | null;
  open: boolean;
  backLabel: string;
  onClose: () => void;
}

/**
 * The card layer: a tapped bead, job, moment, step or node opens into its own full-column scene,
 * growing as a circle from the tap. Back, Escape and a swipe down from the top close it.
 */
export function CardLayer({ card, open, backLabel, onClose }: CardLayerProps) {
  const back = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.scrollTo?.({ top: 0 });
    const t = window.setTimeout(() => back.current?.focus({ preventScroll: true }), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const d = card?.data;
  return (
    <div className={s.layer} data-k="layer" data-open={open ? "" : undefined} aria-hidden={!open}>
      <section
        ref={panel}
        className={s.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="m2-card-t"
        tabIndex={-1}
        style={
          {
            "--ox": `${card?.ox ?? 0}px`,
            "--oy": `${card?.oy ?? 0}px`,
            "--card-wash": d?.wash ?? "var(--brand-cyan)",
          } as React.CSSProperties
        }
        onPointerDown={(e) => {
          if ((e.target as Element).closest("button")) return;
          swipe.current = { x: e.clientX, y: e.clientY, t: e.currentTarget.scrollTop };
        }}
        onPointerMove={(e) => {
          const st = swipe.current;
          if (!st) return;
          const dy = e.clientY - st.y;
          const dx = Math.abs(e.clientX - st.x);
          if (dy > 90 && dy > dx * 1.4 && e.currentTarget.scrollTop <= 0 && st.t <= 0) {
            swipe.current = null;
            onClose();
          }
        }}
        onPointerUp={() => (swipe.current = null)}
        onPointerCancel={() => (swipe.current = null)}
      >
        <header className={s.cardTop}>
          <button ref={back} type="button" className={s.back} onClick={onClose}>
            <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{backLabel}</span>
          </button>
        </header>
        {d && (
          <>
            <div className={s.cardArt} aria-hidden="true">
              {d.art}
            </div>
            <p className={s.cardK}>{d.kicker}</p>
            <h3 className={s.cardT} id="m2-card-t">
              {d.title}
            </h3>
            <div className={s.cardB}>
              {d.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {d.quote && (
                <p>
                  <q>{d.quote}</q>
                </p>
              )}
            </div>
            <p className={s.cardN}>{d.note}</p>
          </>
        )}
      </section>
    </div>
  );
}
