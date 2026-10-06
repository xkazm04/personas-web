"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { EMAIL_RE, FETCH_TIMEOUT_MS, waitlistErrorMessage, type WaitlistStatus } from "@/components/waitlist-modal/waitlistUtils";
import { waitlistErrorLabels } from "@/components/waitlist-modal/waitlistLabels";
import { fill, type ClockCopy } from "./copy";
import s from "./clock.module.css";

interface WaitlistProps {
  c: ClockCopy;
  platform: "macos" | "linux";
  platformName: string;
}

/** macOS / Linux: the site's real waitlist (POST /api/waitlist), with its translated error copy. */
export function Waitlist({ c, platform, platformName }: WaitlistProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<WaitlistStatus>("idle");
  const [msg, setMsg] = useState("");
  const [prev, setPrev] = useState(platform);
  if (prev !== platform) {
    setPrev(platform);
    setStatus("idle");
    setMsg("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      setMsg(t.waitlist.invalidEmail);
      return;
    }
    setStatus("loading");
    setMsg(c.cta.joining);
    const controller = new AbortController();
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, FETCH_TIMEOUT_MS);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, platform }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMsg(waitlistErrorMessage(res.status, data.code, waitlistErrorLabels(t)));
        return;
      }
      setStatus(data.duplicate ? "duplicate" : "success");
      setMsg(fill(data.duplicate ? c.cta.already : c.cta.joined, { platform: platformName }));
    } catch {
      setStatus("error");
      setMsg(timedOut ? t.waitlist.errorTimeout : t.waitlist.errorGeneric);
    } finally {
      window.clearTimeout(timer);
    }
  }

  return (
    <form className={s.mail} data-state={status} noValidate onSubmit={submit}>
      <label htmlFor="m2-mail" className={s.mailTitle}>
        {fill(c.cta.waitlistTitle, { platform: platformName })}
      </label>
      <p className={s.mailNote}>{fill(c.cta.waitlistNote, { platform: platformName })}</p>
      <div className={s.mrow}>
        <input
          id="m2-mail"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={c.cta.emailPlaceholder}
          aria-label={c.cta.emailLabel}
          aria-invalid={status === "error" ? true : undefined}
          aria-describedby="m2-mail-state"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setMsg("");
            }
          }}
        />
        <button type="submit" className={`${s.btn} ${s.send}`} disabled={status === "loading"}>
          <span>{status === "loading" ? c.cta.joining : c.cta.join}</span>
        </button>
      </div>
      <p className={s.state} id="m2-mail-state" role="status" aria-live="polite" data-state={status}>
        {msg}
      </p>
    </form>
  );
}
