/** Theme colours resolved to rgb triples so the canvas can compose alphas (var()/color-mix are not valid canvas input). */
export type Rgb = readonly [number, number, number];
export interface Palette {
  cyan: Rgb;
  purple: Rgb;
  emerald: Rgb;
  amber: Rgb;
  ink: Rgb;
}

const FALLBACK: Palette = {
  cyan: [6, 182, 212],
  purple: [168, 85, 247],
  emerald: [52, 211, 153],
  amber: [251, 191, 36],
  ink: [226, 232, 240],
};

function resolve(probe: CanvasRenderingContext2D, value: string, fallback: Rgb): Rgb {
  if (!value) return fallback;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

export function readPalette(host: Element): Palette {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  if (!ctx) return FALLBACK;
  const cs = getComputedStyle(host);
  const get = (name: string) => cs.getPropertyValue(name).trim();
  return {
    cyan: resolve(ctx, get("--brand-cyan"), FALLBACK.cyan),
    purple: resolve(ctx, get("--brand-purple"), FALLBACK.purple),
    emerald: resolve(ctx, get("--brand-emerald"), FALLBACK.emerald),
    amber: resolve(ctx, get("--brand-amber"), FALLBACK.amber),
    ink: resolve(ctx, get("--foreground"), FALLBACK.ink),
  };
}

export const rgba = (c: Rgb, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a < 0 ? 0 : a > 1 ? 1 : a.toFixed(3)})`;
