import { parseBlocks } from "@/components/guide/guide-markdown/parseBlocks";

/**
 * Blog posts render through the guide's engine (`parseBlocks`), so they get
 * inline links, images, code fences, tables, nested lists, `:::` blocks and
 * heading copy-anchors. Pure function of its input; no client-only state.
 *
 * Posts are authored with `##` for sections and `###` for subsections, but the
 * guide engine renders `#` as the first heading under the page's single <h1>.
 * Shifting each ATX heading up one level keeps the article's outline
 * h1 > h2 > h3 instead of skipping h2. Fenced code is left untouched.
 */
export function shiftBlogHeadings(content: string): string[] {
  let inFence = false;
  return content.split("\n").map((line) => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) return line;
    return /^##{1,2} /.test(line) ? line.slice(1) : line;
  });
}

export function BlogArticleContent({ content, copyAnchorLabel }: { content: string; copyAnchorLabel?: string }) {
  return <div className="prose-custom max-w-none">{parseBlocks(shiftBlogHeadings(content), { copyAnchorLabel })}</div>;
}
