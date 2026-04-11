import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Personas Pricing";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard({
    title: "Simple, transparent pricing",
    subtitle: "The desktop app is free forever. Cloud plans add always-on execution and team features when you're ready to scale.",
    badge: "Pricing",
    badgeColor: "#a855f7",
    accentColor: "#a855f7",
    footer: "personas.ai/pricing",
  });
}
