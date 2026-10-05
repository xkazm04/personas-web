/**
 * Scoped styles for A3. The base declarations are the complete still frame
 * (pulses parked at their own offsets); every animation is layered on top, so
 * reduced motion is `animation: none` and an off-screen hero is one attribute.
 */
export const A3_CSS = `
.a3-svg{position:absolute;inset:0;width:100%;height:100%}
.a3-core{fill:none;stroke:url(#a3-grad);stroke-linecap:round;stroke-linejoin:round}
.a3-glow{fill:none;stroke:url(#a3-grad);stroke-linecap:round;stroke-linejoin:round}
.a3-core,.a3-glow{animation:a3-draw 2.4s var(--dl) cubic-bezier(.3,.7,.2,1) both}
.a3-pulse{fill:none;stroke:var(--foreground);stroke-linecap:round;stroke-width:3.4;stroke-dasharray:46 954;
  stroke-dashoffset:calc(var(--o) * -1);filter:drop-shadow(0 0 5px var(--brand-cyan));
  animation:a3-run var(--t) linear infinite,a3-fade 1.2s calc(1.6s + var(--dl)) ease-out both}
.a3-spin{transform-box:fill-box;transform-origin:center;animation:a3-spin var(--sp) linear infinite}
.a3-breathe{transform-box:fill-box;transform-origin:center;animation:a3-breathe 5.5s ease-in-out infinite}
.a3-tag{font:700 17px var(--font-mono,ui-monospace,monospace);letter-spacing:.16em;fill:var(--foreground);paint-order:stroke;
  stroke:var(--background);stroke-width:7px;stroke-linejoin:round}
@keyframes a3-draw{from{stroke-dasharray:1000;stroke-dashoffset:1000}to{stroke-dasharray:1000;stroke-dashoffset:0}}
@keyframes a3-run{from{stroke-dashoffset:calc(var(--o) * -1)}to{stroke-dashoffset:calc(var(--o) * -1 - 1000)}}
@keyframes a3-fade{from{opacity:0}}
@keyframes a3-spin{to{transform:rotate(360deg)}}
@keyframes a3-breathe{50%{transform:scale(1.12);opacity:.8}}
.a3-root [data-running="false"] *{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.a3-root *{animation:none!important}}
`;
