import { GATHER, RELEASE, WORK_END, type World } from "./swarm";

/** Colours resolved from the site's theme tokens (canvas cannot read CSS vars). */
export interface Palette { hues: string[]; fg: string; light: boolean; font: string }

export function readPalette(el: Element): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name).trim() || "gray";
  const theme = document.documentElement.getAttribute("data-theme") ?? "";
  return {
    hues: [v("--brand-cyan"), v("--brand-purple"), v("--brand-emerald"), v("--brand-amber"), v("--brand-rose")],
    fg: v("--foreground"),
    light: theme.startsWith("light"),
    font: cs.getPropertyValue("--font-mono").trim() || "ui-monospace, monospace",
  };
}

// One soft glow sprite per colour, drawn once and stamped per agent: a
// gradient per agent per frame would cost hundreds of allocations a frame.
const sprites = new Map<string, HTMLCanvasElement>();
function glowSprite(color: string): HTMLCanvasElement {
  let c = sprites.get(color);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "transparent");
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
  }
  sprites.set(color, c);
  return c;
}

/** Paint one frame of the swarm. */
export function drawSwarm(ctx: CanvasRenderingContext2D, world: World, pal: Palette, labels: { handled: string }) {
  const { w, h, agents, teams } = world;
  ctx.clearRect(0, 0, w, h);
  const glow = pal.light ? "source-over" : "lighter";

  // Coaching lines: the coach light keeps a thread to every team.
  ctx.globalCompositeOperation = "source-over";
  ctx.setLineDash([2, 7]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = pal.fg;
  ctx.globalAlpha = pal.light ? 0.22 : 0.16;
  ctx.beginPath();
  for (const tm of teams) { ctx.moveTo(world.ox, world.oy); ctx.lineTo(tm.ax, tm.ay); }
  ctx.stroke();
  ctx.setLineDash([]);

  // Event ripples.
  for (const r of world.ripples) {
    const p = r.age / 1.8;
    ctx.strokeStyle = pal.hues[r.team];
    ctx.lineWidth = 2 - p;
    ctx.globalAlpha = (1 - p) * 0.7;
    ctx.beginPath();
    ctx.arc(r.x, r.y, 12 + p * 190, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = glow;
  teams.forEach((tm, ti) => {
    const hue = pal.hues[ti];
    const m = tm.mission;
    const working = m ? Math.min(1, m.age / GATHER) * (m.age > WORK_END ? Math.max(0, 1 - (m.age - WORK_END) / 0.6) : 1) : 0;

    // Team bonds: consecutive members that are close; the whole ring at work.
    ctx.strokeStyle = hue;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.14 + working * 0.4;
    ctx.beginPath();
    for (let j = 1; j < tm.members.length; j++) {
      const a = agents[tm.members[j - 1]];
      const b = agents[tm.members[j]];
      if (Math.hypot(a.x - b.x, a.y - b.y) < 54) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
    }
    ctx.stroke();

    if (m && working > 0) {
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 120);
      g.addColorStop(0, hue);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.globalAlpha = working * (pal.light ? 0.14 : 0.2);
      ctx.fillRect(m.x - 120, m.y - 120, 240, 240);
    }

    // Agents: a glow, a soft tail along the velocity, then the body.
    const sprite = glowSprite(hue);
    ctx.globalAlpha = pal.light ? 0.16 : 0.24 + working * 0.06;
    for (const i of tm.members) {
      const a = agents[i];
      const r = a.size * (5 + working);
      ctx.drawImage(sprite, a.x - r, a.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    for (const i of tm.members) {
      const a = agents[i];
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x - a.vx * 0.045, a.y - a.vy * 0.045);
    }
    ctx.stroke();
    ctx.fillStyle = hue;
    ctx.globalAlpha = 0.75 + working * 0.25;
    ctx.beginPath();
    for (const i of tm.members) {
      const a = agents[i];
      const r = a.size * (1 + working * 0.5);
      ctx.moveTo(a.x + r, a.y);
      ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
    }
    ctx.fill();
  });

  // The coach light.
  const halo = ctx.createRadialGradient(world.ox, world.oy, 0, world.ox, world.oy, 70);
  halo.addColorStop(0, pal.fg);
  halo.addColorStop(1, "transparent");
  ctx.fillStyle = halo;
  ctx.globalAlpha = pal.light ? 0.12 : 0.22;
  ctx.fillRect(world.ox - 70, world.oy - 70, 140, 140);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = pal.fg;
  ctx.beginPath();
  ctx.arc(world.ox, world.oy, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = pal.fg;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(world.ox, world.oy, 9 + Math.sin(world.t * 2) * 2, 0, Math.PI * 2);
  ctx.stroke();

  // Mission labels: what arrived, then "handled".
  ctx.globalCompositeOperation = "source-over";
  const size = Math.round(Math.min(16, Math.max(13, w / 105)));
  ctx.font = `600 ${size}px ${pal.font}`;
  ctx.textAlign = "center";
  teams.forEach((tm, ti) => {
    const m = tm.mission;
    if (!m) return;
    const done = m.age > WORK_END;
    const fadeIn = Math.min(1, m.age / 0.3);
    const fadeOut = m.age > RELEASE - 0.5 ? Math.max(0, (RELEASE - m.age) / 0.5) : 1;
    const ring = 30 + Math.sqrt(tm.members.length) * 5;
    ctx.globalAlpha = fadeIn * fadeOut;
    ctx.fillStyle = done ? pal.hues[2] : pal.hues[ti];
    ctx.fillText((done ? `✓ ${labels.handled}` : m.label).toUpperCase(), m.x, m.y - ring - 16);
  });
  ctx.globalAlpha = 1;
}
