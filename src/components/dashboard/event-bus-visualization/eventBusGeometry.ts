export const CX = 250;
export const CY = 250;
export const PERSONA_RADIUS = 110;
export const SOURCE_RADIUS = 200;

export interface Point {
  x: number;
  y: number;
}

export interface Particle {
  id: number;
  phase: "inbound" | "outbound";
  t: number;
  speed: number;
  color: string;
  sourcePos: Point;
  targetPos: Point;
  cp: Point;
  burst: number;
  done: boolean;
}

export interface BurstRing {
  id: number;
  x: number;
  y: number;
  t: number;
  color: string;
}

export function nodePosition(index: number, total: number, radius: number, offsetAngle = -Math.PI / 2): Point {
  const angle = offsetAngle + (2 * Math.PI * index) / total;
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) };
}

export function bezierControlPoint(from: Point, to: Point, curveFactor = 0.35): Point {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return {
    x: mx + dy * curveFactor * (Math.random() > 0.5 ? 1 : -1),
    y: my - dx * curveFactor * (Math.random() > 0.5 ? 1 : -1),
  };
}

export function quadBezier(from: Point, cp: Point, to: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * cp.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * cp.y + t * t * to.y,
  };
}
