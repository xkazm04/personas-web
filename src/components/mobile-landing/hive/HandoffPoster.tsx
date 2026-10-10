"use client";

import { Glyph } from "./Glyphs";
import { fill } from "./useHiveCopy";
import { EMAIL_FIELD_ID, type Handoff, type Platform } from "./useHandoff";
import type { MobileLandingCopy } from "./useHiveCopy";

interface Props {
  c: MobileLandingCopy["cta"];
  h: Handoff;
  names: Record<Platform, string>;
  tag: string;
  on: boolean;
}

const STEP_GLYPHS = ["gl-down", "gl-plug", "gl-go"];
const STEP_HEX = "56,25 42,49.2 14,49.2 0,25 14,0.8 42,0.8";

/** What the status line under the form says. */
function message(c: Props["c"], h: Handoff, names: Props["names"]): { text: string; cls: string } {
  if (h.error) return { text: h.error, cls: "msg err" };
  const v = h.view;
  if (v.dock === "sent" && v.sentKind) {
    const name = names[h.platform];
    const text = { shared: c.toastShared, copied: c.toastCopied, joined: fill(c.joined, { platform: name }), already: fill(c.alreadyJoined, { platform: name }) }[v.sentKind];
    return { text, cls: "msg ok" };
  }
  // The one link's hint is the same for every computer: that computer picks its own installer.
  return { text: !v.hint ? "" : h.lane === "send" ? c.hintSend : c[v.hint], cls: "msg" };
}

/**
 * Poster 6: take it to your computer. A phone beams the link to a computer: the dock button sends
 * the one link to everyone (the computer that opens it picks its own installer or waitlist). Copy
 * link and a calendar reminder sit under it. The waitlist is an explicit, secondary opt-in: "Or get
 * an email when it's ready" opens the platforms without an installer (DOWNLOAD_PLAN) and an email
 * field, and the dock then joins the picked platform's waitlist.
 */
export default function HandoffPoster({ c, h, names, tag, on }: Props) {
  const msg = message(c, h, names);
  const onRadioKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const nx = h.waitlist[(i + d + h.waitlist.length) % h.waitlist.length];
    h.setPlatform(nx);
    (e.currentTarget.parentElement?.querySelector(`[data-p="${nx}"]`) as HTMLElement | null)?.focus();
  };

  return (
    <section className={`poster p6${on ? " on" : ""}`} id="s6" data-poster="" aria-labelledby="hm-h6">
      <div className="bg" aria-hidden="true" />
      <div className="copy">
        <h2 id="hm-h6" className="disp" data-role="m-cta-title">{c.title}</h2>
        <p className="sub">{c.sub}</p>
      </div>
      <div className="art beam" data-state={h.beam} role="img" aria-label={c.artLabel}>
        <svg viewBox="0 0 330 190" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
          <ellipse className="floor" cx="160" cy="150" rx="150" ry="34" />
          <path className="trail" d="M44 62 C 76 -10, 170 -12, 202 58" />
          <g className="ph">
            <rect x="12" y="66" width="54" height="108" rx="13" />
            <rect className="sc" x="18" y="78" width="42" height="82" rx="7" />
            <polygon className="lk" points="39,98 50,104.4 50,117.2 39,123.6 28,117.2 28,104.4" />
            <path className="bar" d="M28 138h22M32 146h14" />
            <circle cx="39" cy="168" r="2.4" />
          </g>
          <g className="mon">
            <rect x="184" y="38" width="106" height="84" rx="10" />
            <rect className="sc" x="190" y="44" width="94" height="66" rx="5" />
            <path d="M237 122v18M212 142h50" />
          </g>
          <g className="pk">
            <polygon points="15,0 7.5,13 -7.5,13 -15,0 -7.5,-13 7.5,-13" />
            <path d="M0 -6v9M-4 -1l4 4 4-4M-6 7h12" />
          </g>
          <g className="ok">
            <polygon points="237,50 258,63 258,89 237,102 216,89 216,63" />
            <use href="#hm-gl-check" x="224" y="64" width="26" height="26" />
          </g>
        </svg>
        <p className="tag art-tag">{tag}</p>
      </div>
      <form
        className="send"
        data-route={h.lane === "join" ? "waitlist" : "share"}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (h.optIn) h.join();
          else h.send();
        }}
      >
        {h.optIn && (
          <div className="plat" role="radiogroup" aria-label={c.platformsLabel} data-role="m-plat" style={{ gridTemplateColumns: `repeat(${h.waitlist.length}, 1fr)` }}>
            {h.waitlist.map((p, i) => (
              <button key={p} type="button" role="radio" aria-checked={h.platform === p} tabIndex={h.platform === p ? 0 : -1} data-p={p} onClick={() => h.setPlatform(p)} onKeyDown={(e) => onRadioKey(e, i)}>
                <span>{names[p]}</span>
              </button>
            ))}
          </div>
        )}
        {h.optIn && (
          <label className="field">
            <span className="sr">{c.emailLabel}</span>
            <input
              id={EMAIL_FIELD_ID}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={c.emailPlaceholder}
              aria-describedby="hm-msg"
              aria-invalid={h.error ? true : undefined}
              disabled={h.view.dock === "busy"}
              value={h.email}
              onChange={(e) => h.setEmail(e.target.value)}
              required
            />
          </label>
        )}
        {h.manual ? (
          <label className="manual">
            <span>{c.manual}</span>
            <input className="manual-url" readOnly value={h.url} aria-label={c.manualLabel} onFocus={(e) => e.currentTarget.select()} />
          </label>
        ) : (
          <p className={msg.cls} id="hm-msg" role="status" aria-live="polite">
            {msg.text}
          </p>
        )}
        <div className="row3">
          <button className="ghost" type="button" data-role="m-ghost" onClick={() => void h.copyLink()}>
            <Glyph id="gl-copy" size={20} />
            <span>{c.copyLink}</span>
          </button>
          <button className="ghost" type="button" aria-label={c.reminderLabel} onClick={h.reminder}>
            <Glyph id="gl-cal" size={20} />
            <span>{c.reminder}</span>
          </button>
        </div>
        {h.waitlist.length > 0 && (
          <button className="ghost" type="button" data-role="m-optin" aria-expanded={h.optIn} onClick={h.toggleOptIn}>
            <span>{h.optIn ? c.optInClose : c.optIn}</span>
          </button>
        )}
      </form>
      <ol className="steps">
        {c.steps.map((s, i) => (
          <li key={s}>
            <span className="st">
              <svg viewBox="0 0 56 50" aria-hidden="true">
                <polygon points={STEP_HEX} />
              </svg>
              <Glyph id={STEP_GLYPHS[i]} size={22} className="gi" />
            </span>
            <b data-role="m-step">{s}</b>
          </li>
        ))}
      </ol>
      <p className="fine" data-role="m-fine">{c.fine}</p>
    </section>
  );
}
