import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Personas — AI Agents That Work For You",
    short_name: "Personas",
    description:
      "Build intelligent AI agents in natural language. Orchestrate them locally or in the cloud.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#06b6d4",
    icons: [
      {
        src: "/imgs/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/imgs/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
