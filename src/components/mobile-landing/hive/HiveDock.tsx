"use client";

import { Glyph } from "./Glyphs";
import { fill } from "./useHiveCopy";
import type { Handoff } from "./useHandoff";
import type { MobileLandingCopy } from "./useHiveCopy";

interface Props {
  c: MobileLandingCopy["cta"];
  h: Handoff;
  /** True on the last poster, where the button does the hand-off itself. */
  atEnd: boolean;
  onGo: () => void;
}

/**
 * The always-visible dock button. Before the last poster it jumps there ("Get it on your
 * computer"); on it, it shares or copies the link (Windows) or joins the waitlist (macOS, Linux).
 */
export default function HiveDock({ c, h, atEnd, onGo }: Props) {
  let mode = "go";
  let label = c.go;
  let sub = "";
  let glyph = "gl-down";
  if (atEnd) {
    const win = h.platform === "win";
    if (h.mode === "busy") {
      mode = "busy";
      label = win ? c.send : c.joining;
      glyph = "gl-replay";
    } else if (h.mode === "sent") {
      mode = "sent";
      label = { shared: c.shared, copied: c.copied, joined: fill(c.joined, { platform: h.platformName }), already: fill(c.alreadyJoined, { platform: h.platformName }) }[h.sentKind];
      sub = win ? c.sentSub : "";
      glyph = "gl-check";
    } else {
      mode = "send";
      label = win ? c.send : fill(c.join, { platform: h.platformName });
      sub = win ? c.sendSub : c.joinSub;
      glyph = "gl-share";
    }
  }
  return (
    <div className="dock">
      <div className="cta-ring rounded-full bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple p-px motion-safe:animate-border-flow">
        <button
          className="cta"
          type="button"
          data-mode={mode}
          data-role="m-cta"
          aria-label={atEnd ? undefined : c.goLabel}
          aria-busy={mode === "busy" ? true : undefined}
          onClick={atEnd ? h.send : onGo}
        >
          <span className="cta-t">
            <span className="cta-l">{label}</span>
            <span className="cta-s">{sub}</span>
          </span>
          <Glyph id={glyph} size={22} className="cta-i" />
        </button>
      </div>
    </div>
  );
}
