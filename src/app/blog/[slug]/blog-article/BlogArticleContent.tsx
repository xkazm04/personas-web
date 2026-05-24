function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground font-medium">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return (
        <code
          key={i}
          className="font-mono text-sm rounded bg-white/[0.04] border border-glass px-1.5 py-0.5 text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function BlogArticleContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold text-foreground mt-8 mb-3">
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-foreground mt-10 mb-4">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2 pl-4">
          {items.map((item, j) => (
            <li key={j} className="text-muted leading-relaxed flex gap-2">
              <span className="text-brand-cyan/60 shrink-0 mt-1.5">&#x2022;</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    } else if (line.startsWith("1. ")) {
      const items: string[] = [];
      let idx = i;
      while (idx < lines.length && /^\d+\. /.test(lines[idx])) {
        items.push(lines[idx].replace(/^\d+\. /, ""));
        idx++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2 pl-4 list-decimal list-inside">
          {items.map((item, j) => (
            <li key={j} className="text-muted leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>,
      );
      i = idx;
      continue;
    } else if (line.trim() === "") {
      // Skip empty lines.
    } else if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      elements.push(
        <p key={i} className="text-muted leading-relaxed my-4 italic border-l-2 border-brand-cyan/20 pl-4">
          {line.slice(1, -1)}
        </p>,
      );
    } else {
      elements.push(
        <p key={i} className="text-muted leading-relaxed my-4">
          {renderInline(line)}
        </p>,
      );
    }
    i++;
  }

  return <div className="prose-custom">{elements}</div>;
}
