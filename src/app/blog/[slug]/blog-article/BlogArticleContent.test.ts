import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BLOG_POSTS as posts } from "@/data/blog";

import { BlogArticleContent, shiftBlogHeadings } from "./BlogArticleContent";

describe("shiftBlogHeadings", () => {
  it("lifts ## and ### one level and leaves fenced code alone", () => {
    expect(shiftBlogHeadings("## A\n### B\n```\n## keep\n```\ntext")).toEqual([
      "# A",
      "## B",
      "```",
      "## keep",
      "```",
      "text",
    ]);
  });
});

describe("BlogArticleContent", () => {
  it("renders links, fences and tables the old parser could not", () => {
    const html = renderToStaticMarkup(createElement(BlogArticleContent, { content: "## Title\nSee [guide](/guide) now.\n\n```ts\nconst a = 1;\n```\n\n| a | b |\n|---|---|\n| 1 | 2 |" }));
    expect(html).toContain('href="/guide"');
    expect(html).toContain("const");
    expect(html).toContain("<table");
    expect(html).toMatch(/<h2[^>]*id=/);
  });

  it("renders every shipped post without throwing", () => {
    for (const post of posts) {
      expect(() => renderToStaticMarkup(createElement(BlogArticleContent, { content: post.content }))).not.toThrow();
    }
  });
});
