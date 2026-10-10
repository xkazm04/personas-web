"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { waitlistErrorLabels } from "@/components/waitlist-modal/waitlistLabels";
import { waitlistErrorText } from "../shared/submitWaitlist";
import { fill, type ClockCopy } from "./copy";
import { WAITLIST_FIELD_ID, type useHandoff } from "./useHandoff";
import s from "./clock.module.css";

interface WaitlistProps {
  c: ClockCopy;
  handoff: ReturnType<typeof useHandoff>;
  platformName: string;
}

/**
 * A platform's waitlist (POST /api/waitlist), presentational: the shared hand-off machine owns
 * the submission (one in flight at a time, stale results dropped), this renders its state with the
 * site's translated error copy.
 */
export function Waitlist({ c, handoff, platformName }: WaitlistProps) {
  const { t } = useTranslation();
  const v = handoff.view;
  const status = v.dock === "busy" ? "loading" : v.sentKind === "already" ? "duplicate" : v.sentKind ? "success" : v.error ? "error" : "idle";
  const msg =
    status === "loading"
      ? c.cta.joining
      : status === "success" || status === "duplicate"
        ? fill(status === "duplicate" ? c.cta.already : c.cta.joined, { platform: platformName })
        : v.error
          ? waitlistErrorText(v.error, { ...waitlistErrorLabels(t), errorTimeout: t.waitlist.errorTimeout })
          : "";

  return (
    <form
      className={s.mail}
      data-state={status}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handoff.submit();
      }}
    >
      <label htmlFor={WAITLIST_FIELD_ID} className={s.mailTitle}>
        {fill(c.cta.waitlistTitle, { platform: platformName })}
      </label>
      <p className={s.mailNote}>{fill(c.cta.waitlistNote, { platform: platformName })}</p>
      <div className={s.mrow}>
        <input
          id={WAITLIST_FIELD_ID}
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
          value={handoff.email}
          onChange={(e) => handoff.setEmail(e.target.value)}
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
