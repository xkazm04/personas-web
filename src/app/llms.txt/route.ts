import { buildLlmsIndex } from "@/lib/guide-markdown-export";

export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(buildLlmsIndex(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
