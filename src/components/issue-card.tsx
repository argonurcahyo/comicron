import { BookOpen } from "lucide-react";
import Image from "next/image";

import { EditIssueModal, type CharacterOption, type EventOption, type IssueData, type PublisherOption, type TitleOption } from "@/components/edit-issue-modal";
import { IssueSummaryPreview } from "@/components/issue-summary-preview";
import { Card, CardContent } from "@/components/ui/card";
import { comicCollectionCardClass, comicInsetCardClass } from "@/components/ui/comic-card-styles";
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
  emptyText,
  priority,
  className,
}: IssueCardProps) {
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
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden border-4 border-black bg-[#fffdf6] shadow-[6px_6px_0px_0px_black] transition-all hover:-translate-y-1 hover:rotate-[-0.35deg] hover:shadow-[12px_12px_0px_0px_black]",
        comicCollectionCardClass,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,187,249,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(241,91,181,0.12),transparent_24%)]" />

      <div className="relative aspect-2/3 w-full border-b-4 border-black bg-slate-100 overflow-hidden">
        {issue.cover_url ? (
          <Image
            src={issue.cover_url}
            alt={`${titleName} #${issue.issue_number}`}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[16px_16px] text-slate-500">
            <div className="flex h-24 w-24 items-center justify-center border-4 border-dashed border-black bg-white shadow-[4px_4px_0px_0px_black]">
              <BookOpen className="h-10 w-10" />
            </div>
            <p className="mt-4 font-display text-sm tracking-wider text-ink-black">NO COVER YET</p>
          </div>
        )}

        <div className="absolute left-3 top-3 border-2 border-black bg-white px-2 py-1 shadow-[2px_2px_0px_0px_black]">
          <p className="font-display text-sm text-ink-black">#{issue.issue_number}</p>
        </div>

        <div
          className={cn(
            "absolute right-3 top-3 -rotate-2 border-2 border-black px-2 py-1 font-display text-[10px] tracking-wide shadow-[2px_2px_0px_0px_black]",
            statusStyles,
          )}
        >
          {statusLabel}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.8))] p-4 pt-12">
          <p className="font-display text-2xl leading-none text-white">{titleName || "Untitled"}</p>
          {issue.volume && (
            <p className="mt-2 inline-flex border-2 border-white bg-black/70 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              VOL {issue.volume}
            </p>
          )}
        </div>
      </div>

      <CardContent className="relative flex flex-1 flex-col gap-4 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          {eventLink?.event ? (
            <div className="inline-flex flex-wrap items-center gap-2 border-2 border-black bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-black shadow-[2px_2px_0px_0px_black]">
              <span className="text-primary">Event</span>
              <span>{eventLink.event.name}</span>
              <span className="border border-black bg-pop-yellow px-1.5 py-0.5 font-display text-[9px] text-ink-black">
                #{eventLink.reading_order}
              </span>
            </div>
          ) : (
            <div />
          )}

          <EditIssueModal
            issue={modalIssue}
            titles={titles}
            events={events}
            publishers={publishers}
            characters={characters}
          />
        </div>

        <div
          className={cn(
            "relative mt-auto border-2 border-black bg-[#fff8dc] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] before:absolute before:right-2 before:top-2 before:h-6 before:w-6 before:border-l-2 before:border-t-2 before:border-black before:bg-pop-yellow/70 before:content-['']",
            comicInsetCardClass,
          )}
        >
          <IssueSummaryPreview
            summary={issue.summary}
            characters={characters}
            emptyText={emptyText}
            className="min-h-16 text-sm leading-relaxed text-slate-700 line-clamp-4"
          />
        </div>
      </CardContent>
    </Card>
  );
}
