/** Web Animations for the persona scene. Callers gate on reduced motion and a hidden tab. */
export const SPRING = "cubic-bezier(.3,1.4,.5,1)";
const fin = (a: Animation) => a.finished.then(() => undefined, () => undefined);

/** A copy of the rack's card flies to the scene's card slot, then the caller drops it in. */
export function flyCart(dialog: HTMLElement, src: HTMLElement, target: HTMLElement, lift: number): Promise<void> {
  const a = src.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const fly = src.cloneNode(true) as HTMLElement;
  fly.classList.add("ln-flyer");
  fly.style.cssText += `;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;font-size:${getComputedStyle(src).fontSize}`;
  dialog.appendChild(fly);
  const k = b.width / a.width;
  const dx = b.left - a.left;
  const dy = b.top - lift - a.top;
  const anim = fly.animate(
    [
      { transform: "translate(0,0) scale(1) rotate(-1.2deg)" },
      { transform: `translate(${dx * 0.45}px,${Math.min(dy, 0) * 0.5 - 80}px) scale(${(1 + k) / 2}) rotate(-7deg)`, offset: 0.5 },
      { transform: `translate(${dx}px,${dy}px) scale(${k}) rotate(0deg)` },
    ],
    { duration: 720, easing: "cubic-bezier(.45,0,.25,1)", fill: "forwards" },
  );
  return fin(anim).then(() => fly.remove());
}

export function dropCart(el: HTMLElement, fromEm: number, ms = 480) {
  el.animate(
    [
      { transform: `translateY(-${fromEm}em)`, easing: "cubic-bezier(.5,0,.8,.4)" },
      { transform: "translateY(.8em)", offset: 0.62, easing: SPRING },
      { transform: "none" },
    ],
    { duration: ms },
  );
}

export function liftCart(el: HTMLElement, far: boolean): Promise<void> {
  return fin(
    el.animate(
      far
        ? [{ transform: "none" }, { transform: "translateY(-7em)", offset: 0.45 }, { transform: "translateY(-30em)", opacity: 0 }]
        : [{ transform: "none" }, { transform: "translateY(-7em)" }],
      { duration: far ? 420 : 220, easing: "cubic-bezier(.2,.9,.4,1)", fill: "forwards" },
    ),
  );
}

export function fadeDialog(el: HTMLElement, out: boolean, delay = 0): Promise<void> {
  return fin(
    el.animate([{ opacity: out ? 1 : 0 }, { opacity: out ? 0 : 1 }], {
      duration: out ? 300 : 320,
      delay,
      easing: out ? "ease-in" : "ease-out",
      fill: out ? "forwards" : "none",
    }),
  );
}

/** Rig rises, the left column and the connector modules stagger in. */
export function introStagger(root: HTMLElement) {
  const ease = "cubic-bezier(.2,.8,.2,1)";
  root.querySelector<HTMLElement>(".ln-rig")?.animate(
    [{ transform: "translateY(6em)", opacity: 0 }, { transform: "none", opacity: 1 }],
    { duration: 560, easing: ease },
  );
  root.querySelectorAll<HTMLElement>(".ln-sc-left > *").forEach((el, j) =>
    el.animate([{ transform: "translateY(2em)", opacity: 0 }, { transform: "none", opacity: 1 }], {
      duration: 500,
      delay: 120 + j * 60,
      easing: ease,
      fill: "backwards",
    }),
  );
  root.querySelectorAll<HTMLElement>(".ln-mod").forEach((el, j) => {
    const to = el.classList.contains("ln-on") ? 1 : 0.62;
    el.animate([{ translate: "0 3em", opacity: 0 }, { translate: "0 0", opacity: to }], {
      duration: 480,
      delay: 300 + j * 45,
      easing: SPRING,
      fill: "backwards",
    });
  });
}

/** The card flips over while the notes open, and back. */
export function flipCart(el: HTMLElement, toBack: boolean) {
  const back = "perspective(900px) rotateY(180deg)";
  return el.animate(toBack ? [{ transform: "none" }, { transform: back }] : [{ transform: back }, { transform: "none" }], {
    duration: toBack ? 500 : 450,
    easing: "ease-in-out",
    fill: toBack ? "forwards" : "none",
  });
}
