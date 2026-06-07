import { BLOG_POSTS } from "@/data/blog";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

// Refresh hourly so a post whose `date` crosses into the past becomes live in
// the feed without a redeploy (mirrors the future-date filter on /blog).
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;",
  );
}

export function GET() {
  // Hide future-dated posts, newest first — same rule as the blog index.
  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);
  const cutoff = todayUtc.getTime();
  const posts = BLOG_POSTS.filter((p) => {
    const t = new Date(p.date).getTime();
    return Number.isFinite(t) && t <= cutoff;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>
      <description>${escapeXml(p.description)}</description>
      <category>${escapeXml(p.category)}</category>
      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Announcements, tutorials, and engineering posts from ${escapeXml(SITE_NAME)}.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
