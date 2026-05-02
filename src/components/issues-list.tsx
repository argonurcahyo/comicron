"use client";

import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { IssueCard } from "@/components/issue-card";

type IssueItem = {
  id: string;
  issue_number: string;
  volume: string | null;
  summary: string | null;
  reading_status: string;
  cover_url: string | null;
  event_links?: {
    reading_order: number;
    event: {
      id: string;
      name: string;
    } | null;
  }[] | null;
};

type ModalIssue = {
  id: string;
  issue_number: string;
  volume: string | null;
  summary: string | null;
  reading_status: string;
  cover_url: string | null;
  publisherId: string;
  publisherName: string;
  titleId: string;
  titleName: string;
  eventId?: string;
  readingOrder?: number;
};

type IssuesListProps = {
  issues: IssueItem[];
  selectedTitle: {
    id: string;
    name: string;
    publisher: string | null;
  };
  selectedVolume: string;
  titles: { id: string; name: string }[];
  events: { id: string; name: string }[];
  publishers: { id: string; name: string }[];
  characters: {
    id: string;
    name: string;
    alias: string | null;
    status: string | null;
    affiliation: string | null;
    lore_markdown: string | null;
    avatar_url: string | null;
  }[];
};

export function IssuesList({
  issues,
  selectedTitle,
  selectedVolume,
  titles,
  events,
  publishers,
  characters,
}: IssuesListProps) {
  const [isSorting, setIsSorting] = useState(false);

  function getModalIssue(issue: IssueItem): ModalIssue {
    const eventLink = issue.event_links?.[0];
    return {
      id: issue.id,
      issue_number: issue.issue_number,
      volume: issue.volume,
      summary: issue.summary,
      reading_status: issue.reading_status,
      cover_url: issue.cover_url,
      publisherId:
        publishers.find((publisher) => publisher.name === (selectedTitle.publisher ?? ""))?.id ?? "",
      publisherName: selectedTitle.publisher ?? "",
      titleId: selectedTitle.id,
      titleName: selectedTitle.name,
      eventId: eventLink?.event?.id,
      readingOrder: eventLink?.reading_order,
    };
  }
  const [isAscending, setIsAscending] = useState(true);

  // Sort issues numerically
  const sortedIssues = [...issues].sort((a, b) => {
    const aNum = parseFloat(a.issue_number) || 0;
    const bNum = parseFloat(b.issue_number) || 0;

    if (isAscending) {
      return aNum - bNum;
    } else {
      return bNum - aNum;
    }
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <div>
          <p className="text-xs font-display uppercase tracking-widest text-slate-600">Issues</p>
          {selectedTitle && (
            <m.p
              className="mt-2 bg-black px-2 py-1 font-display text-xs text-white"
              key={`${selectedTitle.id}-${selectedVolume}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {selectedTitle.name} - {selectedVolume === "__none" ? "No Volume" : selectedVolume}
            </m.p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <m.button
            onClick={() => {
              setIsSorting(true);
              setIsAscending(!isAscending);
              setTimeout(() => setIsSorting(false), 400);
            }}
            disabled={isSorting}
            className="relative flex items-center gap-2 border-2 border-black bg-white px-3 py-2 font-display text-xs font-bold uppercase text-ink-black shadow-[2px_2px_0px_0px_black] hover:shadow-[4px_4px_0px_0px_black] transition-shadow disabled:opacity-70"
            title={isAscending ? "Sort descending" : "Sort ascending"}
            whileHover={isSorting ? undefined : { scale: 1.05 }}
            whileTap={isSorting ? undefined : { scale: 0.98 }}
          >
            <m.div
              key={isAscending ? "asc" : "desc"}
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              {isAscending ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </m.div>
            {isSorting ? "Sorting..." : isAscending ? "ASC" : "DESC"}
            {isSorting && (
              <m.span
                className="h-2 w-2 rounded-full bg-ink-black"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
              />
            )}
          </m.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isSorting && (
          <m.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mb-3 flex items-center justify-center gap-2 text-xs text-slate-500"
          >
            <m.span
              className="h-1.5 w-1.5 rounded-full bg-slate-400"
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
            />
            Sorting...
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <m.div
          key={`issues-grid-${isAscending}`}
          className="mt-4 grid gap-4 sm:grid-cols-3 xl:grid-cols-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {sortedIssues.map((issue, index) => {
            const eventLink = issue.event_links?.[0];

            return (
              <m.div
                key={issue.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.03,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <IssueCard
                  issue={issue}
                  titleName={selectedTitle.name}
                  eventLink={eventLink}
                  modalIssue={getModalIssue(issue)}
                  titles={titles}
                  events={events}
                  publishers={publishers}
                  characters={characters}
                  emptyText="Open full edit to add notes and @character mentions."
                  priority={index < 3}
                />
              </m.div>
            );
          })}
          {sortedIssues.length === 0 && <p className="text-sm text-slate-500">No issues exist for this volume yet.</p>}
        </m.div>
      </AnimatePresence>
    </>
  );
}
