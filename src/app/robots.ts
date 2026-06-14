import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = false;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/m/", "/preview", "/demo", "/todo"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
