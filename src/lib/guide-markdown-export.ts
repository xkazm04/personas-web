// Machine-readable projection of the guide: /llms.txt, /llms-full.txt and the
// per-topic raw markdown at /guide/<category>/<topic>.md.
//
// The corpus is DERIVED at build time from GUIDE_CONTENT through the guide
// grammar (`parseGuide`), the same tree the renderer reads, so the flattened
// text can never drift from the page. Custom directives (:::steps, :::compare,
// ...) are flattened to plain CommonMark an agent can read.
//
// Contract: English only (the canonical unit); devOnly topics are excluded via
// `isTopicVisible`; every topic carries its review date (`contentReviewedAt`)
// so a consumer can discount stale material.

import { parseGuide, type GuideNode } from "@/components/guide/guide-markdown/parseGuide";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import type { GuideCategory, GuideTopic } from "@/data/guide/types";
import { isTopicVisible } from "@/lib/guide-utils";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const GUIDE_EXPORT_LOCALE = "en";

const quote = (text: string) =>
  text
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");

const label = (variant: string) => variant.charAt(0).toUpperCase() + variant.slice(1);

function nodeToMarkdown(n: GuideNode): string {
  switch (n.type) {
    case "heading":
      return `${"#".repeat(n.depth)} ${n.text}`;
    case "paragraph":
      return n.text;
    case "code":
      return `\`\`\`${n.lang ?? ""}\n${n.text}\n\`\`\``;
    case "hr":
      return "---";
    case "blockquote":
      return quote(n.text);
    case "ul":
      return n.items.map((i) => `${"  ".repeat(Math.max(0, i.depth))}- ${i.content}`).join("\n");
    case "ol":
      return n.items.map((item, i) => `${i + 1}. ${item}`).join("\n");
    case "table": {
      const row = (cells: string[]) => `| ${cells.join(" | ")} |`;
      return [row(n.headers), row(n.headers.map(() => "---")), ...n.rows.map(row)].join("\n");
    }
    case "callout":
      return quote(`**${label(n.variant)}:** ${n.text}`);
    case "callout-stack":
      return n.items.map((i) => quote(`**${label(i.variant)}:** ${i.text}`)).join("\n\n");
    case "steps":
      return n.steps.map((s, i) => `${i + 1}. **${s.title}**${s.body ? ` - ${s.body}` : ""}`).join("\n");
    case "keys":
      return n.shortcuts.map((s) => `- \`${s.combo}\` - ${s.description}`).join("\n");
    case "compare":
      return n.items.map((i) => `**${i.title}**\n${i.body}`).join("\n\n");
    case "diagram":
      return `Flow: ${n.nodes.map((d) => d.label).join(" -> ")}`;
    case "feature":
      return `**${n.title}**\n${n.body}`;
    case "checklist":
      return n.items.map((i) => `- [ ] ${i}`).join("\n");
    case "usecases":
      return n.items.map((i) => `**${i.title}**\n- Scenario: ${i.scenario}\n- Outcome: ${i.outcome}`).join("\n\n");
    case "code-compare": {
      const block = (title: string | undefined, fallback: string, text: string) =>
        `**${title || fallback}**\n\`\`\`\n${text}\n\`\`\``;
      return `${block(n.beforeLabel, "Before", n.before)}\n\n${block(n.afterLabel, "After", n.after)}`;
    }
    case "tabs":
      return n.tabs.map((t) => `**${t.label}**\n\n${t.paragraphs.join("\n\n")}`).join("\n\n");
    case "cli":
      return `\`\`\`sh\n${n.lines.join("\n")}\n\`\`\``;
    case "cards":
      return n.items.map((c) => `- **${c.title}** (${c.status}) - ${c.description}`).join("\n");
  }
}

/** Flatten a guide topic body (custom directive dialect) into plain CommonMark. */
export function flattenGuideBody(body: string): string {
  return parseGuide(body)
    .doc.map(nodeToMarkdown)
    .join("\n\n")
    .trim();
}

export function topicUrl(topic: Pick<GuideTopic, "id" | "categoryId">): string {
  return `${SITE_URL}/guide/${topic.categoryId}/${topic.id}`;
}

export function topicMarkdownUrl(topic: Pick<GuideTopic, "id" | "categoryId">): string {
  return `${topicUrl(topic)}.md`;
}

/** Visible topics in category order, each paired with its category. */
export function visibleGuideTopics(): { topic: GuideTopic; category: GuideCategory }[] {
  const out: { topic: GuideTopic; category: GuideCategory }[] = [];
  for (const category of GUIDE_CATEGORIES) {
    for (const topic of GUIDE_TOPICS) {
      if (topic.categoryId === category.id && isTopicVisible(topic)) out.push({ topic, category });
    }
  }
  return out;
}

/** One topic as a standalone markdown document with a small front-matter block. */
export function renderTopicMarkdown(topic: GuideTopic, category: GuideCategory, body: string): string {
  const reviewed = topic.coverage?.contentReviewedAt;
  const meta = [
    "---",
    `title: ${JSON.stringify(topic.title)}`,
    `description: ${JSON.stringify(topic.description)}`,
    `category: ${category.id}`,
    `locale: ${GUIDE_EXPORT_LOCALE}`,
    ...(reviewed ? [`reviewed: ${reviewed}`] : []),
    ...(topic.coverage?.appVersion ? [`app_version: ${topic.coverage.appVersion}`] : []),
    `source: ${topicUrl(topic)}`,
    "---",
  ].join("\n");
  return `${meta}\n\n# ${topic.title}\n\n${flattenGuideBody(body)}\n`;
}

/** /llms.txt - the llmstxt.org index: one line per visible topic. */
export function buildLlmsIndex(): string {
  const lines = [
    `# ${SITE_NAME} Guide`,
    "",
    `> Documentation for ${SITE_NAME}, a desktop app for building and orchestrating AI agent personas. Locale: ${GUIDE_EXPORT_LOCALE}. Each link below is a plain-markdown page; the whole guide is at ${SITE_URL}/llms-full.txt.`,
  ];
  const all = visibleGuideTopics();
  for (const category of GUIDE_CATEGORIES) {
    const topics = all.filter((e) => e.category.id === category.id);
    if (topics.length === 0) continue;
    lines.push("", `## ${category.name}`, "");
    for (const { topic } of topics) {
      const reviewed = topic.coverage?.contentReviewedAt?.slice(0, 10);
      lines.push(
        `- [${topic.title}](${topicMarkdownUrl(topic)}): ${topic.description}${reviewed ? ` (reviewed ${reviewed})` : ""}`,
      );
    }
  }
  return `${lines.join("\n")}\n`;
}

/** /llms-full.txt - every visible topic body, flattened, in one document. */
export function buildLlmsFull(content: Record<string, string>): string {
  const parts = [`# ${SITE_NAME} Guide (full)`, "", `Locale: ${GUIDE_EXPORT_LOCALE}. Index: ${SITE_URL}/llms.txt`];
  for (const { topic, category } of visibleGuideTopics()) {
    const body = content[topic.id];
    if (body === undefined) continue;
    const reviewed = topic.coverage?.contentReviewedAt?.slice(0, 10);
    parts.push(
      "",
      "---",
      "",
      `## ${topic.title}`,
      "",
      `Category: ${category.name} | Source: ${topicUrl(topic)}${reviewed ? ` | Reviewed: ${reviewed}` : ""}`,
      "",
      // Body headings sit one level below the topic heading so the outline stays valid.
      flattenGuideBody(body).replace(/^(#{1,5}) /gm, "$1# "),
    );
  }
  return `${parts.join("\n")}\n`;
}
