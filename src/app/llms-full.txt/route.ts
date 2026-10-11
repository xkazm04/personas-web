import { GUIDE_CONTENT } from "@/data/guide/content";
import { buildLlmsFull } from "@/lib/guide-markdown-export";

export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(buildLlmsFull(GUIDE_CONTENT), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
