/**
 * Scoped styles for the A2 glass stack. Every animation lives here, so reduced
 * motion (and the paused state) is one media query / one attribute: the base
 * styles are the complete, settled frame and `animation: none` falls back to it.
 */
export const A2_CSS = `
.a2-stage{position:absolute;inset:0;perspective:1700px;perspective-origin:50% 38%;pointer-events:none}
.a2-anchor{position:absolute;left:75%;top:57%;width:0;height:0}
.a2-rig{--s:min(35vw,56svh);transform-style:preserve-3d;
  transform:rotateX(calc(60deg + var(--py,0) * -7deg)) rotateZ(calc(-42deg + var(--px,0) * 12deg));
  transition:transform .6s cubic-bezier(.2,.7,.2,1)}
@media (max-width:1023px){.a2-anchor{left:50%;top:80%}.a2-rig{--s:min(72vw,36svh)}}
.a2-plane{--c:var(--brand-cyan);position:absolute;width:var(--s);height:var(--s);left:calc(var(--s) * -.5);top:calc(var(--s) * -.5);
  transform:translateZ(calc(var(--s) * var(--z)));border-radius:5%;
  border:1px solid color-mix(in srgb,var(--c) 60%,transparent);
  background:linear-gradient(135deg,color-mix(in srgb,var(--c) 24%,transparent),color-mix(in srgb,var(--c) 6%,transparent) 70%);
  box-shadow:0 0 50px color-mix(in srgb,var(--c) 26%,transparent),inset 0 0 50px color-mix(in srgb,var(--c) 16%,transparent);
  animation:a2-rise 1.7s var(--d) cubic-bezier(.2,.8,.2,1) both,a2-bob 8s var(--d) ease-in-out infinite}
.a2-plane svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.a2-label{position:absolute;left:4%;bottom:3.5%;display:flex;align-items:center;gap:.6em;font:700 clamp(.8rem,1.15vw,1.05rem)/1 var(--font-mono,ui-monospace,monospace);
  letter-spacing:.14em;text-transform:uppercase;color:var(--foreground)}
.a2-label i{width:.7em;height:.7em;border-radius:50%;background:var(--c);box-shadow:0 0 12px var(--c)}
.a2-beam{position:absolute;width:3px;margin-left:-1.5px;height:calc(var(--s) * .42);left:calc(var(--s) * var(--bx));top:calc(var(--s) * var(--by) - var(--s) * .42);
  transform-origin:50% 100%;transform:translateZ(calc(var(--s) * -.21)) rotateX(-90deg);
  background:linear-gradient(to top,transparent,color-mix(in srgb,var(--brand-cyan) 55%,transparent) 20%,color-mix(in srgb,var(--brand-purple) 55%,transparent) 62%,color-mix(in srgb,var(--brand-amber) 70%,transparent));
  animation:a2-fade 1.6s 1.1s ease-out both}
.a2-beam::after{content:"";position:absolute;left:-1px;right:-1px;bottom:0;height:12%;border-radius:3px;background:var(--foreground);
  box-shadow:0 0 14px 3px color-mix(in srgb,var(--brand-cyan) 70%,transparent);animation:a2-climb 3.4s var(--bd) cubic-bezier(.45,0,.55,1) infinite}
.a2-ripple{transform-box:fill-box;transform-origin:center;animation:a2-ripple 3.6s var(--rd) ease-out infinite}
.a2-pulse{animation:a2-pulse 3.2s var(--rd) ease-in-out infinite}
.a2-spin{transform-box:view-box;transform-origin:50% 50%;animation:a2-spin var(--sp) linear infinite}
.a2-spin-c{transform-box:fill-box;transform-origin:center;animation:a2-spin var(--sp) linear infinite}
.a2-flow{animation:a2-flow 2.4s linear infinite}
@keyframes a2-rise{from{transform:translateZ(0);opacity:0}}
@keyframes a2-bob{50%{translate:0 0 calc(var(--s) * .014)}}
@keyframes a2-fade{from{opacity:0}}
@keyframes a2-climb{0%{transform:translateY(0);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translateY(-740%);opacity:0}}
@keyframes a2-ripple{0%{transform:scale(1);opacity:.9}100%{transform:scale(7);opacity:0}}
@keyframes a2-pulse{50%{opacity:.95}}
@keyframes a2-spin{to{transform:rotate(360deg)}}
@keyframes a2-flow{to{stroke-dashoffset:-6}}
.a2-stage[data-running="false"] *{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.a2-root *{animation:none!important;transition:none!important}}
`;
