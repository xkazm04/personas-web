import type { MetadataRoute } from "next";
import { BG_NEAR_BLACK } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = false;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Personas — AI Agents That Work For You",
    short_name: "Personas",
    description:
      "Build intelligent AI agents in natural language. Orchestrate them locally or in the cloud.",
    start_url: "/",
    display: "standalone",
    background_color: BG_NEAR_BLACK,
    theme_color: "#06b6d4",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
