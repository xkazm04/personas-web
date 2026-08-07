import { connectors } from "@/data/connectors";
import HeroClient from "./HeroClient";

/**
 * Server wrapper for the hero. The connector catalog (~1600 lines of prose)
 * is reduced to a single number HERE, on the server, and passed down as a
 * prop — same pattern as `roadmap/roadmap-area-counts.ts`. Importing it from
 * the client component pulled the whole catalog into the first chunk a
 * visitor parses, while still deriving the badge number from the shipped
 * catalog so it can never drift.
 */
export default function Hero() {
  return <HeroClient connectorCount={connectors.length} />;
}
