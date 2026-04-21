"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

import { comicInsetCardClass } from "@/components/ui/comic-card-styles";

type MarkdownEditorProps = {
  name: string;
  initialValue: string;
};

export function MarkdownEditor({ name, initialValue }: MarkdownEditorProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Markdown Editor
        </span>
        <textarea
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={16}
          className="w-full rounded-2xl border border-card-line bg-[#fffdf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary"
          placeholder="## Origin\nWrite the character lore here..."
        />
      </label>

      <section className={`${comicInsetCardClass} p-4`}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Preview
        </p>
        <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "_Empty_"}</ReactMarkdown>
        </article>
      </section>
    </div>
  );
}
