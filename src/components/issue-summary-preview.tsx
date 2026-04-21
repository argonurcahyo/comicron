import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type CharacterOption = {
  id: string;
  name: string;
  alias: string | null;
};

import { renderSummaryWithCharacterLinks } from "@/lib/character-mentions";

type IssueSummaryPreviewProps = {
  summary: string | null;
  characters: CharacterOption[];
  emptyText: string;
  className?: string;
};

export function IssueSummaryPreview({
  summary,
  characters,
  emptyText,
  className,
}: IssueSummaryPreviewProps) {
  const trimmed = summary?.trim() ?? "";

  if (!trimmed) {
    return <p className={className}>{emptyText}</p>;
  }

  const markdown = renderSummaryWithCharacterLinks(trimmed, characters);

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p>{children}</p>,
          a: ({ href, children }) => {
            if (!href) {
              return <span>{children}</span>;
            }

            return (
              <Link href={href} className="font-semibold text-primary underline decoration-primary/40 underline-offset-2">
                {children}
              </Link>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}