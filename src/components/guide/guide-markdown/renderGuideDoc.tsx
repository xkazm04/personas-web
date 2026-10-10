import type { ReactNode } from "react";

import {
  ArchitectureDiagram,
  Callout,
  CalloutStack,
  CardsBlock,
  Checklist,
  CliBlock,
  CodeCompare,
  CodeFence,
  CompareBlock,
  FeatureHighlight,
  KeyboardGrid,
  MarkdownTable,
  StepWizard,
  TabBlock,
  UseCaseGrid,
} from "../GuideBlocks";
import { expandLineRanges } from "./expandLineRanges";
import { HeadingAnchor } from "./HeadingAnchor";
import type { GuideNode } from "./parseGuide";
import { parseInline } from "./parseInline";

/**
 * Renders the tree `parseGuide` builds. A total switch over node types: the
 * grammar lives in parseGuide, this file only draws what it found.
 */
export function renderGuideDoc(doc: readonly GuideNode[], opts: { copyAnchorLabel?: string } = {}): ReactNode[] {
  return doc.map((node, n) => renderNode(node, `b${n}`, opts.copyAnchorLabel ?? "Copy link to section"));
}

function renderNode(node: GuideNode, key: string, copyLabel: string): ReactNode {
  switch (node.type) {
    case "heading":
      // Content headings render one level down: the topic title is the page's
      // single <h1> (TopicView), so "#" becomes <h2>, capped at <h4>.
      return (
        <HeadingAnchor key={key} depth={Math.min(node.depth + 1, 4) as 2 | 3 | 4} id={node.id} rawText={node.text} copyLabel={copyLabel}>
          {parseInline(node.text, `h${key}`)}
        </HeadingAnchor>
      );
    case "paragraph":
      return <p key={key} className="text-base text-muted-dark leading-relaxed mb-4">{parseInline(node.text, `p${key}`)}</p>;
    case "code":
      return (
        <CodeFence
          key={key}
          text={node.text}
          lang={node.lang}
          lineNumbers={node.lineNumbers}
          highlightLines={node.highlight ? expandLineRanges(node.highlight) : undefined}
        />
      );
    case "hr":
      return <hr key={key} className="border-t border-glass my-8" />;
    case "blockquote":
      return (
        <blockquote key={key} className="border-l-2 border-brand-purple/40 pl-4 py-1 mb-4 text-muted italic bg-white/[0.01] rounded-r-lg">
          {parseInline(node.text, `bq${key}`)}
        </blockquote>
      );
    case "ul":
      return buildUnorderedList(node.items, 0, 0, key).node;
    case "ol":
      return (
        <ol key={key} className="list-decimal list-inside space-y-1 mb-4 text-muted-dark">
          {node.items.map((text, i) => (
            <li key={i} className="text-base leading-relaxed">{parseInline(text, `ol${key}-${i}`)}</li>
          ))}
        </ol>
      );
    case "table":
      // Cells run through parseInline so `code`, **bold** and links render.
      return (
        <MarkdownTable
          key={key}
          headers={node.headers.map((cell, ci) => parseInline(cell, `th${ci}`))}
          rows={node.rows.map((row, ri) => row.map((cell, ci) => parseInline(cell, `td${ri}-${ci}`)))}
        />
      );
    case "callout":
      return <Callout key={key} type={node.variant}><p>{parseInline(node.text, key)}</p></Callout>;
    case "steps":
      return <StepWizard key={key} steps={node.steps} />;
    case "keys":
      return <KeyboardGrid key={key} shortcuts={node.shortcuts} />;
    case "compare":
      return <CompareBlock key={key} items={node.items} />;
    case "diagram":
      return <ArchitectureDiagram key={key} nodes={node.nodes} />;
    case "feature":
      return <FeatureHighlight key={key} title={node.title} body={node.body} color={node.color} />;
    case "checklist":
      return <Checklist key={key} items={node.items} />;
    case "usecases":
      return <UseCaseGrid key={key} items={node.items} />;
    case "code-compare":
      return <CodeCompare key={key} before={node.before} after={node.after} beforeLabel={node.beforeLabel} afterLabel={node.afterLabel} />;
    case "tabs":
      return (
        <TabBlock
          key={key}
          tabs={node.tabs.map((tab, t) => ({
            label: tab.label,
            panel: (
              <>
                {tab.paragraphs.map((p, pi) => (
                  <p key={`${key}-t${t}-p${pi}`} className="mb-3 text-base leading-relaxed text-muted-dark last:mb-0">
                    {parseInline(p, `${key}-t${t}-p${pi}`)}
                  </p>
                ))}
              </>
            ),
          }))}
        />
      );
    case "cli":
      return <CliBlock key={key} lines={node.lines} />;
    case "callout-stack":
      return (
        <CalloutStack
          key={key}
          items={node.items.map((item, s) => ({ type: item.variant, node: <p>{parseInline(item.text, `${key}-s${s}`)}</p> }))}
        />
      );
    case "cards":
      return (
        <CardsBlock
          key={key}
          items={node.items.map((card, c) => ({
            status: card.status,
            title: card.title,
            description: <>{card.description ? parseInline(card.description, `${key}-c${c}`) : null}</>,
            imageBase: card.imageBase,
          }))}
        />
      );
    default: {
      const unhandled: never = node;
      return unhandled;
    }
  }
}

function buildUnorderedList(items: { depth: number; content: string }[], from: number, depth: number, key: string): { node: ReactNode; next: number } {
  const children: ReactNode[] = [];
  let index = from;
  while (index < items.length && items[index].depth >= depth) {
    if (items[index].depth === depth) {
      // A deeper list belongs INSIDE this <li>: a <ul> directly inside a <ul> is
      // invalid HTML and breaks list semantics for assistive tech.
      const liContent: ReactNode[] = [parseInline(items[index].content, `ul${key}-${index}`)];
      const liIndex = index++;
      if (index < items.length && items[index].depth > depth) {
        const sub = buildUnorderedList(items, index, items[index].depth, key);
        liContent.push(sub.node);
        index = sub.next;
      }
      children.push(<li key={`li${liIndex}`} className="text-base leading-relaxed">{liContent}</li>);
    } else {
      // A deeper item with no same-depth <li> before it (malformed indentation):
      // recurse so nothing is dropped.
      const sub = buildUnorderedList(items, index, items[index].depth, key);
      children.push(sub.node);
      index = sub.next;
    }
  }
  const listKey = from === 0 && depth === 0 ? key : `ul${key}-${from}-${depth}`;
  return { node: <ul key={listKey} className="list-disc list-inside space-y-1 mb-4 text-muted-dark">{children}</ul>, next: index };
}
