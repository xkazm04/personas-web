// Raw markdown of one guide topic. The public URL is /guide/<category>/<topic>.md;
// next.config.ts rewrites it here (a `.md` suffix cannot follow a dynamic
// segment in an app-router folder name).
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_CONTENT } from "@/data/guide/content";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { isTopicVisible } from "@/lib/guide-utils";
import { renderTopicMarkdown, visibleGuideTopics } from "@/lib/guide-markdown-export";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return visibleGuideTopics().map(({ topic }) => ({ category: topic.categoryId, topic: topic.id }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ category: string; topic: string }> }) {
  const { category: categoryId, topic: topicId } = await ctx.params;
  const topic = GUIDE_TOPICS.find((t) => t.id === topicId && t.categoryId === categoryId);
  const category = GUIDE_CATEGORIES.find((c) => c.id === categoryId);
  const body = GUIDE_CONTENT[topicId];
  if (!topic || !category || body === undefined || !isTopicVisible(topic)) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(renderTopicMarkdown(topic, category, body), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
