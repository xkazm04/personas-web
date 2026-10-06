/**
 * The page's glyph sprite: every glyph is drawn for this page and inherits currentColor. Ported
 * verbatim from the winner's index.html (ids prefixed hm- so they cannot collide with another
 * sprite). Reference a glyph with <Glyph id="gl-check" />.
 */
const SPRITE = `
<symbol id="hm-g-head" viewBox="0 0 24 24"><circle cx="12" cy="8.2" r="3.9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4.4 21c.7-4.3 3.6-6.7 7.6-6.7s6.9 2.4 7.6 6.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="8.2" r="1.25" fill="currentColor"/></symbol>
<symbol id="hm-g-team" viewBox="0 0 40 28"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"><circle cx="20" cy="9" r="4.6"/><path d="M10.6 26c.9-5.4 4.4-8.3 9.4-8.3s8.5 2.9 9.4 8.3"/><circle cx="8.6" cy="11" r="3" opacity=".7"/><path d="M2 24c.5-3.4 2.6-5.3 5.6-5.6" opacity=".7"/><circle cx="31.4" cy="11" r="3" opacity=".7"/><path d="M38 24c-.5-3.4-2.6-5.3-5.6-5.6" opacity=".7"/></g></symbol>
<symbol id="hm-gl-power" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M7.2 6.4a7.6 7.6 0 1 0 9.6 0"/><path d="M12 3v8"/></g></symbol>
<symbol id="hm-gl-mic" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.2M8.8 21.2h6.4"/></g></symbol>
<symbol id="hm-gl-mem" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.8l7.4 4.3v8.6L12 20l-7.4-4.3V7.1z"/><circle cx="12" cy="9" r="1.7"/><circle cx="8.6" cy="14.2" r="1.5"/><circle cx="15.4" cy="14.2" r="1.5"/><path d="M11 10.4 9.4 12.9M13 10.4l1.6 2.5M10.1 14.2h3.8"/></g></symbol>
<symbol id="hm-gl-ping" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="1.8" fill="currentColor"/><path d="M7.6 7.6a6.2 6.2 0 0 0 0 8.8M16.4 7.6a6.2 6.2 0 0 1 0 8.8M4.6 4.6a10.4 10.4 0 0 0 0 14.8M19.4 4.6a10.4 10.4 0 0 1 0 14.8"/></g></symbol>
<symbol id="hm-gl-term" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="10" width="34" height="28" rx="5"/><path d="M14 20l6 5-6 5M25 31h9"/></g></symbol>
<symbol id="hm-gl-shield" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6l15 5.4v11.2c0 9.2-6.2 15.8-15 19.4-8.8-3.6-15-10.2-15-19.4V11.4z"/><circle cx="24" cy="22.5" r="4.6"/><path d="M24 27.2v5.2"/></g></symbol>
<symbol id="hm-gl-coin" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="16.5"/><path d="M29.4 18.4c-1.2-1.6-3-2.4-5.4-2.4-3 0-5 1.4-5 3.6 0 2.4 2.2 3.1 5.2 3.9 3 .8 5.2 1.6 5.2 4 0 2.3-2.2 3.9-5.4 3.9-2.5 0-4.6-.9-5.8-2.7M24 12.5v3.5M24 32v3.5"/></g></symbol>
<symbol id="hm-gl-inf" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M24 24c-3.6-5.6-6.4-8.4-10.4-8.4a8.4 8.4 0 0 0 0 16.8C17.6 32.4 20.4 29.6 24 24zm0 0c3.6 5.6 6.4 8.4 10.4 8.4a8.4 8.4 0 0 0 0-16.8C30.4 15.6 27.6 18.4 24 24z"/></g></symbol>
<symbol id="hm-gl-down" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v13M6.4 11.8 12 17.4l5.6-5.6M5 21h14"/></g></symbol>
<symbol id="hm-gl-plug" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5l-3.2 3.2a3 3 0 0 1-4.2-4.2l3.2-3.2M14.5 9.5l3.2-3.2a3 3 0 1 1 4.2 4.2l-3.2 3.2M8.8 15.2l6.4-6.4"/></g></symbol>
<symbol id="hm-gl-go" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.8c3.6 1.9 5.6 5.4 5.6 9.2l-2.4 4.4H8.8L6.4 12c0-3.8 2-7.3 5.6-9.2z"/><circle cx="12" cy="9.4" r="1.7"/><path d="M8.8 16.4 7 20.6l3.4-1.5M15.2 16.4l1.8 4.2-3.4-1.5"/></g></symbol>
<symbol id="hm-gl-chev-l" viewBox="0 0 24 24"><path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="hm-gl-chev-r" viewBox="0 0 24 24"><path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="hm-gl-replay" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4.4 3.8v4.4h4.4"/></g></symbol>
<symbol id="hm-gl-back" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 5.5 4 12l6.5 6.5M4.6 12H20"/></g></symbol>
<symbol id="hm-gl-check" viewBox="0 0 24 24"><path d="M5 12.6l4.4 4.4L19 7.4" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="hm-gl-copy" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="8.5" width="11" height="11" rx="2.6"/><path d="M15.5 8.5V6.4a2.4 2.4 0 0 0-2.4-2.4H6.4A2.4 2.4 0 0 0 4 6.4v6.7a2.4 2.4 0 0 0 2.4 2.4h2.1"/></g></symbol>
<symbol id="hm-gl-share" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3.8M7.8 7.8 12 3.6l4.2 4.2M5 12v6.4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V12"/></g></symbol>
<symbol id="hm-gl-cal" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.8" y="5" width="16.4" height="15.2" rx="3"/><path d="M8 3v4M16 3v4M3.8 10h16.4M8.5 14.6h3v3"/></g></symbol>`;

export function GlyphSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs dangerouslySetInnerHTML={{ __html: SPRITE }} />
    </svg>
  );
}

export function Glyph({ id, size, className }: { id: string; size: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} aria-hidden="true">
      <use href={`#hm-${id}`} />
    </svg>
  );
}
