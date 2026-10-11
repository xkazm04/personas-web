import { TEMPLATES_OG_SUBTITLE } from "@/lib/public-claims";
import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Personas Templates";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard({
    title: "Agent Templates",
    subtitle: TEMPLATES_OG_SUBTITLE,
    badge: "Templates",
    badgeColor: "#a855f7",
    accentColor: "#a855f7",
    footer: "personas.so/templates",
  });
}
