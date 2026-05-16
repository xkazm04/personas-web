import type { ReactNode } from "react";

export function parseInline(text: string, keyBase: string): ReactNode[] {
  const re =
    /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]*)\]\(([^)]+)\)|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let keyIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));

    const key = `${keyBase}-i${keyIndex++}`;
    if (match[1] !== undefined || match[2] !== undefined) {
      nodes.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={match[2]}
          alt={match[1] || "Illustration"}
          className="rounded-xl max-w-full h-auto my-4"
        />,
      );
    } else if (match[3] !== undefined) {
      nodes.push(
        <a
          key={key}
          href={match[4]}
          className="text-brand-cyan underline underline-offset-2 hover:text-white transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          title="Opens in new tab"
        >
          {parseInline(match[3], key)}
        </a>,
      );
    } else if (match[5] !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground italic">
          {parseInline(match[5], key)}
        </strong>,
      );
    } else if (match[6] !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {parseInline(match[6], key)}
        </strong>,
      );
    } else if (match[7] !== undefined) {
      nodes.push(
        <em key={key} className="italic">
          {parseInline(match[7], key)}
        </em>,
      );
    } else if (match[8] !== undefined) {
      nodes.push(
        <code key={key} className="px-1.5 py-0.5 rounded bg-white/[0.06] text-base font-mono text-brand-cyan">
          {match[8]}
        </code>,
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
