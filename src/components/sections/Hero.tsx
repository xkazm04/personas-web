import { connectors } from "@/data/connectors";
import { templates } from "@/lib/templates";
import HeroClient from "./HeroClient";

/**
 * Server wrapper for the hero. The heavy catalogs (~1600 lines of connector
 * prose, ~1900 lines of template prose) are reduced to single numbers HERE, on
 * the server, and passed down as props — same pattern as
 * `roadmap/roadmap-area-counts.ts`. Importing them from the client component
 * pulled the whole catalog into the first chunk a visitor parses, while still
 * deriving the badge numbers from the shipped catalogs so they can never drift.
 *
 * PROVENANCE of the three "adoption snapshot" figures:
 * - Connectors — DERIVED from `connectors.length` (125 today). Same source as
 *   `AREA_COUNTS.connectors` on the roadmap card.
 * - Templates  — DERIVED from `templates.length` (57 today). This used to read
 *   `${liveStats.totalTemplates}+`, i.e. "120+", which came from the marketing
 *   floor in `/api/stats` and contradicted both the shipped catalog and the
 *   roadmap's own `AREA_COUNTS.templateTotal` four files away. A visitor can
 *   count the gallery, so this number now counts the same thing they would.
 * - Agents     — NOT derivable: nothing in this repo enumerates running agents,
 *   so `/api/stats` supplies a marketing floor. It stays, and `HeroClient`
 *   marks it as an approximation whenever the API reports it as anything other
 *   than a measurement (see `isMeasuredStat`).
 */
export default function Hero() {
  return <HeroClient connectorCount={connectors.length} templateCount={templates.length} />;
}
