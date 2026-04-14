"use client";

const KEYWORD_TEST = /^(inbox|draft|replies|urgent|emails|PR|#142|bugs|style|issues|missing|tests|#engineering|#product|channels|24h|calendar|focus|time|next week)$/i;

export default function SyntaxPrompt({ text }: { text: string }) {
  const parts = text.split(
    /(\b(?:inbox|draft|replies|urgent|emails|PR|#142|bugs|style|issues|missing|tests|#engineering|#product|channels|24h|calendar|focus|time|next week)\b)/gi
  );

  return (
    <div className="font-mono text-base leading-relaxed">
      <span className="text-muted-dark">{">"} </span>
      {parts.map((part, i) => {
        const isKeyword = KEYWORD_TEST.test(part);
        return (
          <span key={i} className={isKeyword ? "text-brand-cyan" : "text-muted"}>
            {part}
          </span>
        );
      })}
    </div>
  );
}
