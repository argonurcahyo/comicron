"use client";

import { BookOpen, Eye } from "lucide-react";
import { useState } from "react";

import { type CharacterOption, type EventOption, type IssueData, type PublisherOption, type TitleOption } from "@/components/edit-issue-modal";
import { IssueDetailModal } from "@/components/issue-detail-modal";
import { AnimatedCoverImage } from "@/components/ui/cover-image";
import { Reveal } from "@/components/ui/motion";
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

type IssueCardProps = {
  issue: IssueCardData;
  titleName: string;
  eventLink?: IssueEventLink | null;
  modalIssue: IssueData;
  titles: TitleOption[];
  events: EventOption[];
  publishers: PublisherOption[];
  characters: CharacterOption[];
  emptyText: string;
  priority?: boolean;
  className?: string;
};

export function IssueCard({
  issue,
  titleName,
  eventLink,
  modalIssue,
  titles,
  events,
  publishers,
  characters,
  priority,
  className,
}: IssueCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  const statusDotStyle =
    issue.reading_status === "completed"
      ? "bg-pop-cyan"
      : issue.reading_status === "reading"
        ? "bg-pop-yellow"
        : issue.reading_status === "dropped"
          ? "bg-primary"
          : "bg-slate-300";

  return (
    <Reveal>
      <button
        type="button"
        onClick={() => setDetailOpen(true)}
        className={cn(
          "group relative flex w-full cursor-pointer flex-col overflow-hidden border-4 border-black bg-[#fffdf6] text-left shadow-[6px_6px_0px_0px_black] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_black]",
          className,
        )}
      >
        {/* Cover */}
        <div className="relative aspect-2/3 w-full overflow-hidden bg-slate-100">
          {issue.cover_url ? (
            <AnimatedCoverImage
              src={issue.cover_url}
              alt={`${titleName} #${issue.issue_number}`}
              className="transition-transform duration-500 group-hover:scale-105"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[16px_16px] text-slate-400">
              <div className="flex h-20 w-20 items-center justify-center border-4 border-dashed border-black bg-white shadow-[4px_4px_0px_0px_black]">
                <BookOpen className="h-9 w-9" />
              </div>
              <p className="mt-3 font-display text-xs tracking-wider text-ink-black">NO COVER</p>
            </div>
          )}

          {/* Hover affordance */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/25">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-white bg-black/60 opacity-0 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-90">
              <Eye className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="flex items-center justify-between gap-2 border-t-4 border-black bg-white px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-display text-sm leading-tight text-ink-black">{titleName || "Untitled"}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              #{issue.issue_number}
              {issue.volume ? ` · Vol ${issue.volume}` : ""}
            </p>
          </div>
          <span
            className={cn(
              "h-3 w-3 shrink-0 border-2 border-black shadow-[1px_1px_0px_0px_black]",
              statusDotStyle,
            )}
            title={issue.reading_status}
          />
        </div>
      </button>

      <IssueDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        issue={issue}
        titleName={titleName}
        eventLink={eventLink}
        modalIssue={modalIssue}
        titles={titles}
        events={events}
        publishers={publishers}
        characters={characters}
      />
    </Reveal>
  );
}
