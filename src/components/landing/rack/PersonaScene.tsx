"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import { LnKeyButton } from "../shared/LnKey";
import SceneBus from "./SceneBus";
import SceneDeck from "./SceneDeck";
import LinerNotes from "./LinerNotes";
import { PERSONA_META, colorVar, fill, pad2 } from "./data";
import { dropCart, fadeDialog, flipCart, flyCart, introStagger, liftCart } from "./sceneMotion";
import { trapTab } from "./trapTab";
import { useSceneSteps } from "./useSceneSteps";

interface Props {
  index: number;
  getOpenerCart: (i: number) => HTMLElement | null;
  onIndex: (i: number) => void;
  /** `home` asks the page to scroll back to the hero instead of restoring focus. */
  onClose: (opts?: { home?: boolean }) => void;
}

/**
 * The opened persona: a real modal `<dialog>`. The browser traps focus, makes
 * everything behind it inert, closes on Esc and (with our restore in the rack)
 * returns focus to the card that opened it. Nothing here locks page scroll.
 */
export default function PersonaScene({ index, getOpenerCart, onIndex, onClose }: Props) {
  const { t } = useTranslation();
  const r = t.landingNext.rack;
  const still = useStillMotion();
  const p = r.personas[index];
  const meta = PERSONA_META[index];
  const total = r.personas.length;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bayRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const done = useRef(false);
  const busy = useRef(false);
  const [notes, setNotes] = useState(false);
  const steps = useSceneSteps({ id: index, request: p.request, steps: p.steps, firstDelay: 1150, laterDelay: 420 });

  // Open as a modal, take focus, and (with motion) fly the card in from the rack.
  useLayoutEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (!d.open) d.showModal();
    nameRef.current?.focus({ preventScroll: true });
    const target = bayRef.current?.firstElementChild as HTMLElement | null;
    const src = getOpenerCart(index);
    if (still || document.hidden || !target || !src) return;
    target.style.visibility = "hidden";
    void fadeDialog(d, false);
    introStagger(d);
    const fs = parseFloat(getComputedStyle(target).fontSize);
    void flyCart(d, src, target, 9 * fs).then(() => {
      target.style.visibility = "";
      dropCart(target, 9);
    });
    return () => {
      target.style.visibility = "";
      if (d.open) d.close();
    };
    // Mount only: later persona changes are handled by `swap` and the drop-in effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A stepped-to persona drops in after the old one lifted out.
  const prev = useRef(index);
  useEffect(() => {
    if (prev.current === index) return;
    prev.current = index;
    const el = bayRef.current?.firstElementChild as HTMLElement | null;
    if (el && !still && !document.hidden) dropCart(el, 9);
    busy.current = false;
  }, [index, still]);

  const finish = useCallback(
    (opts?: { home?: boolean }) => {
      if (done.current) return;
      done.current = true;
      dialogRef.current?.close();
      onClose(opts);
    },
    [onClose],
  );

  const close = (opts?: { home?: boolean }) => {
    if (busy.current) return;
    busy.current = true;
    setNotes(false);
    const d = dialogRef.current;
    const el = bayRef.current?.firstElementChild as HTMLElement | null;
    if (still || document.hidden || !d || !el) return finish(opts);
    void liftCart(el, false);
    void fadeDialog(d, true, 160).then(() => finish(opts));
  };

  const swap = (dir: number) => {
    if (busy.current) return;
    setNotes(false);
    const ni = (index + dir + total) % total;
    const el = bayRef.current?.firstElementChild as HTMLElement | null;
    if (still || document.hidden || !el) return onIndex(ni);
    busy.current = true;
    void liftCart(el, true).then(() => onIndex(ni));
  };

  const openNotes = () => {
    setNotes(true);
    const el = bayRef.current?.firstElementChild as HTMLElement | null;
    if (el && !still) flipCart(el, true);
  };
  const closeNotes = () => {
    setNotes(false);
    const el = bayRef.current?.firstElementChild as HTMLElement | null;
    if (el && !still) flipCart(el, false);
    const d = dialogRef.current;
    // After the notes dialog has closed, so its own focus restore cannot overwrite this.
    setTimeout(() => d?.querySelector<HTMLElement>("[data-notes-btn]")?.focus({ preventScroll: true }), 0);
  };

  return (
    <dialog
      ref={dialogRef}
      className="ln-scene"
      aria-labelledby="ln-sc-name"
      style={{ "--ln-pc": colorVar(meta.color) } as CSSProperties}
      onKeyDown={trapTab}
      onCancel={(e) => {
        if (e.target !== e.currentTarget) return; // React bubbles the notes dialog's cancel up the tree
        e.preventDefault();
        close();
      }}
      // StrictMode's mount/cleanup/mount queues a stale close event; only a really closed dialog counts.
      onClose={(e) => {
        if (e.target === e.currentTarget && !e.currentTarget.open) finish();
      }}
    >
      <div className="ln-sc-inner">
        <div className="ln-sc-top">
          <nav className="ln-crumbs" aria-label={r.crumbsLabel}>
            <ol>
              <li><button type="button" onClick={() => close({ home: true })}>{r.crumbHome}</button></li>
              <li><button type="button" onClick={() => close()}>{r.crumbList}</button></li>
              <li><span aria-current={notes ? undefined : "page"}>{p.name}</span></li>
              {notes ? <li><span aria-current="page">{r.crumbNotes}</span></li> : null}
            </ol>
          </nav>
          <div className="ln-sc-ctl">
            <LnKeyButton size="sm" aria-label={r.prevLabel} onClick={() => swap(-1)}>{r.prev}</LnKeyButton>
            <LnKeyButton size="sm" aria-label={r.nextLabel} onClick={() => swap(1)}>{r.next}</LnKeyButton>
            <LnKeyButton size="sm" tone="dark" icon="i-eject" onClick={() => close()}>{r.close}</LnKeyButton>
          </div>
        </div>
        <div className="ln-sc-left">
          <p className="ln-idx">{fill(r.sceneIndex, { n: pad2(index + 1), total: pad2(total) })}</p>
          <h2 className="ln-sc-name" id="ln-sc-name" ref={nameRef} tabIndex={-1}>{p.name}</h2>
          <p className="ln-sc-hand">{`“${p.label}”`}</p>
          <ul className="ln-sc-meta">
            <li><b>{r.startsOn}</b><span>{`${p.triggerKind}: ${p.triggerNote.charAt(0).toLowerCase()}${p.triggerNote.slice(1)}`}</span></li>
            <li><b>{r.connectedTo}</b><span>{meta.connectors.map((k) => r.connectors[k]).join(", ")}</span></li>
          </ul>
          <div className="ln-sc-actions">
            <LnKeyButton tone="signal" icon="i-flip" onClick={openNotes} aria-haspopup="dialog" data-notes-btn="">{r.readNotes}</LnKeyButton>
          </div>
        </div>
        <SceneDeck
          bayRef={bayRef}
          index={index}
          running={steps.started}
          step={steps.step}
          request={steps.request}
          text={steps.text}
          onStep={steps.goTo}
        />
        <SceneBus active={meta.connectors} />
      </div>
      {notes ? <LinerNotes index={index} onClose={closeNotes} onCloseScene={() => close()} /> : null}
    </dialog>
  );
}
