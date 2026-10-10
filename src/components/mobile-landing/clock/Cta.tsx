"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import GradientText from "@/components/GradientText";
import PrimaryCTA from "@/components/PrimaryCTA";
import { miniFace } from "./art";
import { CTA_FACES } from "./data";
import { CTA_HOUR, hhmm } from "./geometry";
import { Waitlist } from "./Waitlist";
import type { ClockCopy } from "./copy";
import type { useHandoff } from "./useHandoff";
import s from "./clock.module.css";

function MiniFace({ h, m }: { h: number; m: number }) {
  const f = miniFace(h, m);
  return (
    <svg className={s.mini} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx={50} cy={50} r={46} className={s.mr} />
      {f.ticks.map((t, i) => (
        <line key={i} {...t} className={s.mt} />
      ))}
      <line x1={50} y1={50} {...f.hour} strokeWidth={6} className={s.hand} />
      <line x1={50} y1={50} {...f.minute} strokeWidth={4} className={s.hand} />
      <circle cx={50} cy={50} r={4.5} className={s.mc} />
    </svg>
  );
}

interface CtaProps {
  c: ClockCopy;
  handoff: ReturnType<typeof useHandoff>;
}

/**
 * Chapter 6, 23:00: tomorrow, 9:00, at your computer. A phone cannot install Personas, and cannot
 * know which computer its visitor owns, so the call to action carries the intent over the same way
 * for everyone: a calendar reminder, the share sheet or the clipboard. The computer that opens the
 * link picks its own installer or waitlist. A platform's waitlist is the explicit secondary path
 * ("Or get an email when it's ready"), over the platforms without an installer (DOWNLOAD_PLAN).
 * There is no email service, so nothing offers to email a link.
 */
export function Cta({ c, handoff }: CtaProps) {
  const plat = handoff.state.platform;
  // A plain toggle: closed on the server and on the first client render alike.
  const [optIn, setOptIn] = useState(false);
  return (
    <section className={s.flow} data-k="cta" id="get-it" aria-labelledby="m2-cta-h">
      <div className={s.clockbig} aria-hidden="true">
        {hhmm(CTA_HOUR)}
      </div>
      <p className={s.kick}>
        <span className={s.tag}>{c.chrome.stylized}</span> {c.cta.kick}
      </p>
      <h2 className={s.hl} id="m2-cta-h">
        <span className={s.ln}>{c.cta.lines[0]}</span>
        <span className={s.ln}>
          <GradientText>{c.cta.lines[1]}</GradientText>
        </span>
      </h2>
      <p className={s.sub}>{c.cta.sub}</p>

      <ol className={s.faces} data-role="faces">
        {CTA_FACES.map((f, i) => (
          <li key={i}>
            <MiniFace h={f.h} m={f.m} />
            <b>{`${f.h}:${String(f.m).padStart(2, "0")}`}</b>
            <span>{c.cta.faces[i]}</span>
          </li>
        ))}
      </ol>

      <div className={s.remind} data-role="remind">
        <PrimaryCTA icon={CalendarPlus} label={c.cta.remind} variant="solid" onClick={handoff.remind} />
      </div>
      <p className={s.fine}>{c.cta.remindFine}</p>

      <div className={s.mail} data-role="send">
        <p className={s.mailTitle}>{c.cta.sendTitle}</p>
        <p className={s.mailNote}>{c.cta.sendNote}</p>
        <div className={s.duo}>
          <button type="button" className={`${s.btn} ${s.ghost}`} onClick={handoff.copy}>
            <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
              <rect x="8.5" y="8.5" width="11" height="12" rx="2.4" fill="none" stroke="currentColor" strokeWidth={2} />
              <path d="M15.5 5.5v-.1A1.9 1.9 0 0 0 13.6 3.5H6.4A1.9 1.9 0 0 0 4.5 5.4v8.2a1.9 1.9 0 0 0 1.9 1.9h.1" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
            <span>{c.cta.copy}</span>
          </button>
          <button type="button" className={`${s.btn} ${s.ghost}`} onClick={handoff.share}>
            <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
              <path d="M12 15V3.5M7.5 8L12 3.5 16.5 8M5 13v5.5A2 2 0 0 0 7 20.5h10a2 2 0 0 0 2-2V13" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{c.cta.share}</span>
          </button>
        </div>
      </div>

      {handoff.waitlist.length > 0 && (
        <button type="button" className={`${s.btn} ${s.ghost} mt-3 w-full`} data-role="optin" aria-expanded={optIn} onClick={() => setOptIn((o) => !o)}>
          <span>{optIn ? c.cta.optInClose : c.cta.optIn}</span>
        </button>
      )}
      {optIn && (
        <>
          <div className={s.plats} data-role="plats" data-route={handoff.state.route} role="group" aria-label={c.cta.platsAria} style={{ gridTemplateColumns: `repeat(${handoff.waitlist.length}, 1fr)` }}>
            {handoff.waitlist.map((p) => (
              <button key={p} type="button" className={s.plat} aria-pressed={plat === p} onClick={() => handoff.setPlatform(p)}>
                <b>{c.cta.plats[p].name}</b>
                <small>{c.cta.platWaitlist}</small>
              </button>
            ))}
          </div>
          <Waitlist c={c} handoff={handoff} platformName={c.cta.plats[plat].name} />
        </>
      )}

      {handoff.manual && (
        <p className={s.manual} role="status">
          {c.cta.manual}
        </p>
      )}
      <p className={s.link} data-manual={handoff.manual ? "" : undefined} data-role="handoff-link">
        {handoff.url}
      </p>
      <p className={`${s.fine} ${s.need}`}>{c.cta.need}</p>
    </section>
  );
}
