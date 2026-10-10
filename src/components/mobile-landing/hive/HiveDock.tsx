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
 * computer"); on it, it does what the shared machine's view says: share or copy the link where an
 * installer is live (DOWNLOAD_PLAN), join that platform's waitlist everywhere else.
 */
export default function HiveDock({ c, h, atEnd, onGo }: Props) {
  let mode: string = "go";
  let label = c.go;
  let sub = "";
  let glyph = "gl-down";
  if (atEnd) {
    const v = h.view;
    const join = fill(c.join, { platform: h.platformName });
    mode = v.dock;
    if (v.dock === "busy") {
      label = v.showEmail ? c.joining : c.send;
      glyph = "gl-replay";
    } else if (v.dock === "sent") {
      label = { shared: c.shared, copied: c.copied, joined: fill(c.joined, { platform: h.platformName }), already: fill(c.alreadyJoined, { platform: h.platformName }) }[v.sentKind ?? "shared"];
      sub = v.showEmail ? "" : c.sentSub;
      glyph = "gl-check";
    } else {
      // "send" and "join" share the idle look (data-mode="send"); only the words differ.
      mode = "send";
      label = v.dock === "send" ? c.send : join;
      sub = v.dock === "send" ? c.sendSub : c.joinSub;
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
