/** How far above the roof line each trade's ornament reaches (the wire anchor). */
const RISE: Record<string, number> = {
  finance: 50,
  support: 88,
  growth: 64,
  eng: 34,
  sales: 106,
  legal: 76,
  data: 70,
  people: 52,
  infra: 100,
};

export const ornamentAnchor = (teamId: string, top: number) => top - (RISE[teamId] ?? 10);
