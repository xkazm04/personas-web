"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import LnIcon from "../shared/LnIcon";
import { LnKeyButton } from "./../shared/LnKey";
import { trapTab } from "./trapTab";
import { PERSONA_META, colorVar, fill } from "./data";
import type { CSSProperties } from "react";

/**
 * The persona's notes, a nested modal dialog over the scene (the browser makes
 * the scene inert while it is open). Esc and the scrim close it; `onClose`
 * runs once for every path, including the browser's own close.
 */
export default function LinerNotes({
  index,
  onClose,
  onCloseScene,
}: {
  index: number;
  onClose: () => void;
  onCloseScene: () => void;
}) {
  const { t } = useTranslation();
  const r = t.landingNext.rack;
  const p = r.personas[index];
  const meta = PERSONA_META[index];
  const ref = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const trig = `${p.triggerKind}: ${p.triggerNote.charAt(0).toLowerCase()}${p.triggerNote.slice(1)}.`;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    nameRef.current?.focus({ preventScroll: true });
    return () => {
      if (d.open) d.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="ln-notes"
      aria-labelledby="ln-jc-name"
      onKeyDown={trapTab}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={(e) => {
        if (e.target === e.currentTarget && !e.currentTarget.open) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <article className="ln-jcard ln-paper" style={{ "--ln-pc": colorVar(meta.color) } as CSSProperties}>
        <div className={`ln-jc-spine${meta.darkSpine ? " ln-dark" : ""}`} aria-hidden="true">
          <LnIcon id={meta.glyph} />
          <span className="ln-vert">{p.name}</span>
        </div>
        <div className="ln-jc-panel">
          <h3>{r.notesSide}</h3>
          <h2 id="ln-jc-name" ref={nameRef} tabIndex={-1}>{p.name}</h2>
          <h3>{r.notesDoes}</h3>
          <p>{p.does}</p>
          <h3>{r.notesTrigger}</h3>
          <p>{trig}</p>
          <h3>{r.notesConnected}</h3>
          <ul className="ln-jc-chips">
            {meta.connectors.map((k) => (
              <li key={k}>
                <LnIcon id={`g-${k}`} />
                {r.connectors[k]}
              </li>
            ))}
          </ul>
        </div>
        <div className="ln-jc-panel">
          <h3>{r.notesCoachTitle}</h3>
          <div className="ln-receipt">
            <span>{fill(r.notesReceipt, { name: p.name })}</span>
            <div className="ln-hand">{`“${p.coach}”`}</div>
          </div>
          <p className="ln-jc-foot">{r.notesFoot}</p>
          <div className="ln-jc-back">
            <LnKeyButton tone="dark" onClick={onClose}>{r.notesBack}</LnKeyButton>
            <LnKeyButton onClick={onCloseScene}>{r.close}</LnKeyButton>
          </div>
        </div>
      </article>
    </dialog>
  );
}
