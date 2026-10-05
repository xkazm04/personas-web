import { needsTone } from "../attention";
import type { FleetAgent } from "../fleet-data";
import type { RailItem } from "../NeedsYouRail";
import { reasonShort, type CityCopy } from "./vocab";

const shortAge = (min: number) => (min < 60 ? `${Math.floor(min)}m` : min < 1440 ? `${Math.floor(min / 60)}h` : `${Math.floor(min / 1440)}d`);

/** The rail's rows for agents already ranked most-urgent-first. The age is
 *  the oldest waiting review, when there is one. */
export function railItems(copy: CityCopy, ranked: FleetAgent[], simMs: number): RailItem[] {
  return ranked.map((a) => {
    const oldest = a.reviews.reduce((m, r) => Math.max(m, r.ageMin), -1);
    return {
      id: a.id,
      callsign: a.callsign,
      name: a.name,
      reason: reasonShort(copy, a).text,
      tone: needsTone(a),
      age: oldest >= 0 ? shortAge(oldest + simMs / 60000) : undefined,
    };
  });
}
