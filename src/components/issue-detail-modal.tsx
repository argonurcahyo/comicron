"use client";

import { m } from "framer-motion";
import { BookOpen, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";

import { EditIssueModal, type CharacterOption, type EventOption, type IssueData, type PublisherOption, type TitleOption } from "@/components/edit-issue-modal";
import { panelTransition, springTransition } from "@/components/ui/motion";
import { renderSummaryWithCharacterLinks } from "@/lib/character-mentions";
import { cn } from "@/lib/utils";

type IssueEventLink = {
  reading_order: number;
  event: { id: string; name: string } | null;
};

type IssueCardData = {
  id: string;
  issue_number: string;
  volume: string | null;
  summary: string | null;
  reading_status: string;
  cover_url: string | null;
};

interface IssueDetailModalProps {
  open: boolean;
  onClose: () => void;
  issue: IssueCardData;
  titleName: string;
  eventLink?: IssueEventLink | null;
  modalIssue: IssueData;
  titles: TitleOption[];
  events: EventOption[];
  publishers: PublisherOption[];
  characters: CharacterOption[];
}

export function IssueDetailModal({
  open,
  onClose,
  issue,
  titleName,
  eventLink,
  modalIssue,
  titles,
  events,
  publishers,
  characters,
}: IssueDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const previewMarkdown = renderSummaryWithCharacterLinks(issue.summary ?? "", characters);

  const statusStyles =
    issue.reading_status === "completed"
      ? "bg-pop-cyan text-ink-black"
      : issue.reading_status === "reading"
        ? "bg-pop-yellow text-ink-black"
        : issue.reading_status === "dropped"
          ? "bg-primary text-white"
          : "bg-slate-200 text-slate-700";

  const statusLabel = issue.reading_status.replace(/_/g, " ");

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-[min(900px,calc(100vw-2rem))] h-[min(620px,calc(100vh-2rem))] overflow-hidden border-4 border-black bg-white p-0 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] backdrop:bg-slate-950/60"
    >
      <m.div
        key={open ? "open" : "closed"}
        initial={open ? { opacity: 0, y: 14, scale: 0.985 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={panelTransition}
        className="flex h-full flex-col sm:flex-row"
      >
        {/* Left — Cover */}
        <div className="relative w-full shrink-0 overflow-hidden border-b-4 border-black bg-slate-100 sm:h-full sm:w-auto sm:aspect-2/3 sm:border-b-0 sm:border-r-4">
          {issue.cover_url ? (
            <Image
              src={issue.cover_url}
              alt={`${titleName} #${issue.issue_number}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 256px"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[16px_16px] text-slate-400">
              <BookOpen className="h-12 w-12" />
              <p className="mt-3 font-display text-xs tracking-wider text-ink-black">NO COVER</p>
            </div>
          )}
        </div>

        {/* Right — Info */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* Header bar */}
          <div className="flex shrink-0 items-start justify-between gap-4 border-b-4 border-black bg-pop-yellow px-5 py-4">
            <div className="min-w-0">
              {modalIssue.publisherName ? (
                <p className="mb-1 text-[10px] font-display tracking-widest text-ink-black/60">
                  {modalIssue.publisherName}
                </p>
              ) : null}
              <h2 className="font-display text-2xl leading-tight text-ink-black">{titleName}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {issue.volume ? (
                  <span className="border-2 border-black bg-white px-2 py-0.5 font-display text-xs text-ink-black shadow-[2px_2px_0px_0px_black]">
                    VOL {issue.volume}
                  </span>
                ) : null}
                <span className="border-2 border-black bg-white px-2 py-0.5 font-display text-xs text-ink-black shadow-[2px_2px_0px_0px_black]">
                  #{issue.issue_number}
                </span>
                <span
                  className={cn(
                    "border-2 border-black px-2 py-0.5 font-display text-xs shadow-[2px_2px_0px_0px_black]",
                    statusStyles,
                  )}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            <m.button
              type="button"
              onClick={onClose}
              className="comic-button-secondary shrink-0 px-2 py-2"
              whileHover={{ y: -2 }}
              whileTap={{ y: 1, scale: 0.985 }}
              transition={springTransition}
            >
              <X className="h-4 w-4" />
            </m.button>
          </div>

          {/* Crossover event strip */}
          {eventLink?.event ? (
            <div className="shrink-0 border-b-2 border-black bg-white px-5 py-3">
              <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-black shadow-[2px_2px_0px_0px_black]">
                <span className="text-primary">Crossover</span>
                <span>{eventLink.event.name}</span>
                <span className="border border-black bg-pop-yellow px-1.5 py-0.5 font-display text-[9px] text-ink-black">
                  #{eventLink.reading_order}
                </span>
              </div>
            </div>
          ) : null}

          {/* Notes */}
          <div className="flex-1 overflow-y-auto p-5">
            <p className="mb-3 text-[10px] font-display tracking-[0.18em] text-slate-500">ISSUE NOTES</p>
            {issue.summary?.trim() ? (
              <div className="text-sm leading-relaxed text-slate-700">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 list-disc pl-5 space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 space-y-0.5">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-700">{children}</li>,
                    h1: ({ children }) => <h1 className="mb-2 font-display text-xl text-ink-black">{children}</h1>,
                    h2: ({ children }) => <h2 className="mb-2 font-display text-lg text-ink-black">{children}</h2>,
                    h3: ({ children }) => <h3 className="mb-1 font-display text-base text-ink-black">{children}</h3>,
                    strong: ({ children }) => <strong className="font-bold text-ink-black">{children}</strong>,
                    blockquote: ({ children }) => (
                      <blockquote className="my-2 border-l-4 border-pop-cyan pl-3 italic text-slate-500">{children}</blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-primary">{children}</code>
                    ),
                    a: ({ href, children }) => {
                      if (!href) return <span>{children}</span>;
                      return (
                        <Link
                          href={href}
                          className="font-semibold text-primary underline decoration-primary/40 underline-offset-2"
                        >
                          {children}
                        </Link>
                      );
                    },
                  }}
                >
                  {previewMarkdown}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">
                No notes yet. Click{" "}
                <span className="font-semibold not-italic text-ink-black">Edit Issue</span> to add some.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t-2 border-black bg-slate-50 p-4">
            <m.button
              type="button"
              onClick={onClose}
              className="comic-button-secondary px-4 py-2 text-xs"
              whileHover={{ y: -2 }}
              whileTap={{ y: 1, scale: 0.985 }}
              transition={springTransition}
            >
              Close
            </m.button>
            <EditIssueModal
              issue={modalIssue}
              titles={titles}
              events={events}
              publishers={publishers}
              characters={characters}
            />
          </div>
        </div>
      </m.div>
    </dialog>
  );
}
