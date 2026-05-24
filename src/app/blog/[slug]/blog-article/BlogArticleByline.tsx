import { Bot } from "lucide-react";

export function BlogArticleByline({
  author,
  categoryColor,
  publishedLabel,
  publishedDate,
}: {
  author: string;
  categoryColor: string;
  publishedLabel: string;
  publishedDate: string;
}) {
  return (
    <div className="mt-12 pt-8 border-t border-glass flex items-center gap-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: `${categoryColor}1f`,
          color: categoryColor,
        }}
      >
        <Bot className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold text-foreground">{author}</p>
        <p className="text-sm text-muted-dark">
          {publishedLabel} {publishedDate}
        </p>
      </div>
    </div>
  );
}
