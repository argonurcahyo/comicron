"use client";

import { AnimatePresence, m } from "framer-motion";
import { CalendarRange, Hash, Layers3, Maximize2, Minimize2, Pencil, X } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { deleteIssueAction, updateIssueAction } from "@/app/actions";
import { EventCombobox } from "@/components/event-combobox";
import { PublisherCombobox } from "@/components/publisher-combobox";
import { TitleCombobox } from "@/components/title-combobox";
import { comicInsetCardClass } from "@/components/ui/comic-card-styles";
import { MotionStatus, panelTransition, springTransition } from "@/components/ui/motion";
import { formatCharacterMention, renderSummaryWithCharacterLinks } from "@/lib/character-mentions";
import { cn } from "@/lib/utils";

export type TitleOption = { id: string; name: string };
export type EventOption = { id: string; name: string };
export type PublisherOption = { id: string; name: string };
export type CharacterOption = {
  id: string;
  name: string;
  alias: string | null;
  status: string | null;
  affiliation: string | null;
  lore_markdown: string | null;
  avatar_url: string | null;
};

export interface IssueData {
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
}

interface EditIssueModalProps {
  issue: IssueData;
  titles: TitleOption[];
  events: EventOption[];
  publishers: PublisherOption[];
  characters: CharacterOption[];
}

function SaveChangesButton() {
  const { pending } = useFormStatus();

  return (
    <m.button
      type="submit"
      disabled={pending}
      className="comic-button-primary"
      whileHover={pending ? undefined : { y: -2 }}
      whileTap={pending ? undefined : { y: 1, scale: 0.985 }}
      transition={springTransition}
    >
      {pending ? "Saving Changes..." : "Save Changes"}
      {pending ? (
        <m.span
          className="h-2 w-2 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.06, 0.9] }}
          transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      ) : null}
    </m.button>
  );
}

export function EditIssueModal({ issue, titles, events, publishers, characters }: EditIssueModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverPreviewLoaded, setCoverPreviewLoaded] = useState(false);
  const [summary, setSummary] = useState(issue.summary ?? "");
  const [mentionQuery, setMentionQuery] = useState("");
  const normalizedQuery = mentionQuery.trim().toLowerCase();
  const previewMarkdown = renderSummaryWithCharacterLinks(summary, characters);

  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(normalizedQuery) ||
    (character.alias ?? "").toLowerCase().includes(normalizedQuery),
  );
  const hasExactCharacterMatch = characters.some(
    (character) =>
      character.name.trim().toLowerCase() === normalizedQuery ||
      (character.alias ?? "").trim().toLowerCase() === normalizedQuery,
  );

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  function insertMention(name: string) {
    const mention = formatCharacterMention(name);
    const textarea = summaryRef.current;

    if (!mention) {
      return;
    }

    if (!textarea) {
      setSummary((current) => `${current}${current ? " " : ""}${mention}`);
      return;
    }

    const start = textarea.selectionStart ?? summary.length;
    const end = textarea.selectionEnd ?? summary.length;
    const nextValue = `${summary.slice(0, start)}${mention}${summary.slice(end)}`;

    setSummary(nextValue);
    setMentionQuery("");

    requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = start + mention.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function open() {
    setSummary(issue.summary ?? "");
    setMentionQuery("");
    setIsFullscreen(false);
    setFileError(null);
    setCoverPreviewLoaded(false);
    setIsOpen(true);
    dialogRef.current?.showModal();
  }

  function close() {
    setIsOpen(false);
    dialogRef.current?.close();
    setIsFullscreen(false);
    setFileError(null);
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
      setCoverPreviewUrl(null);
    }
    setCoverPreviewLoaded(false);
  }

  return (
    <>
      <m.button
        type="button"
        onClick={open}
        className="comic-button-secondary px-3 py-1.5 text-xs"
        whileHover={{ y: -2 }}
        whileTap={{ y: 1, scale: 0.985 }}
        transition={springTransition}
      >
        <Pencil className="h-3 w-3" />
        Edit
      </m.button>

      <dialog
        ref={dialogRef}
        className={cn(
          "m-auto overflow-hidden border-4 border-black bg-white p-0 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] backdrop:bg-slate-950/50",
          isFullscreen
            ? "h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none"
            : "max-h-[calc(100vh-2rem)] w-[min(1080px,calc(100vw-2rem))]",
        )}
      >
        <m.div
          key={`${issue.id}-${isOpen ? "open" : "closed"}-${isFullscreen ? "fullscreen" : "windowed"}`}
          initial={isOpen ? { opacity: 0, y: 18, scale: 0.985 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={panelTransition}
        >
          <div className="flex items-center justify-between border-b-4 border-black bg-pop-yellow px-6 py-4">
            <div>
              <h2 className="font-display text-xl text-ink-black">Edit Issue</h2>
              <p className="mt-1 text-sm text-slate-700">Update metadata, replace the cover, and keep issue notes in one place.</p>
            </div>
            <div className="flex items-center gap-2">
              <m.button
                type="button"
                onClick={() => setIsFullscreen((current) => !current)}
                className="comic-button-secondary px-3 py-2 text-xs"
                whileHover={{ y: -2 }}
                whileTap={{ y: 1, scale: 0.985 }}
                transition={springTransition}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {isFullscreen ? "Windowed" : "Full Screen"}
              </m.button>
              <m.button
                type="button"
                onClick={close}
                className="comic-button-secondary px-2 py-2 text-xs"
                whileHover={{ y: -2 }}
                whileTap={{ y: 1, scale: 0.985 }}
                transition={springTransition}
              >
                <X className="h-4 w-4" />
              </m.button>
            </div>
          </div>

          <form
            action={async (fd) => {
              await updateIssueAction(fd);
              close();
            }}
            className={cn(
              "grid gap-6 overflow-y-auto p-6",
              isFullscreen ? "h-[calc(100%-85px)] lg:grid-cols-[1fr_1fr]" : "max-h-[calc(100vh-8rem)] lg:grid-cols-[1.05fr_0.95fr]",
            )}
          >
          <input type="hidden" name="issue_id" value={issue.id} />

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-display tracking-[0.18em] text-slate-600">Series</p>
              <TitleCombobox
                titles={titles}
                defaultTitleId={issue.titleId}
                defaultTitleName={issue.titleName}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-display tracking-[0.18em] text-slate-600">Publisher</p>
              <PublisherCombobox
                publishers={publishers}
                defaultPublisherId={issue.publisherId}
                defaultPublisherName={issue.publisherName}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2 text-xs font-display text-slate-600">
                  <Layers3 className="h-3.5 w-3.5" />
                  Volume
                </span>
                <input
                  name="volume"
                  defaultValue={issue.volume ?? ""}
                  placeholder="Vol. 2"
                  className="comic-input py-2 pl-3 pr-3"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2 text-xs font-display text-slate-600">
                  <Hash className="h-3.5 w-3.5" />
                  Issue Number
                </span>
                <input
                  name="issue_number"
                  required
                  defaultValue={issue.issue_number}
                  placeholder="15"
                  className="comic-input py-2 pl-3 pr-3"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2 text-xs font-display text-slate-600">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Crossover Event
                </span>
                <EventCombobox
                  events={events}
                  defaultEventId={issue.eventId ?? ""}
                  defaultEventName={events.find((event) => event.id === issue.eventId)?.name ?? ""}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-1">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Reading Status</span>
                <select
                  name="reading_status"
                  defaultValue={issue.reading_status}
                  className="comic-select"
                >
                  <option value="planned">Planned</option>
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </label>
            </div>

            <div className="border-2 border-black bg-slate-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-display tracking-[0.18em] text-slate-600">Cover Art</p>
                  <p className="mt-1 text-sm text-slate-500">Upload a replacement cover or keep the current one.</p>
                </div>
              </div>

              <input
                name="cover_file"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (!file) {
                    setFileError(null);
                    if (coverPreviewUrl) {
                      URL.revokeObjectURL(coverPreviewUrl);
                    }
                    setCoverPreviewUrl(null);
                    setCoverPreviewLoaded(false);
                    return;
                  }

                  if (file.size > 8 * 1024 * 1024) {
                    event.currentTarget.value = "";
                    setFileError("Cover image is too large. Maximum file size is 8MB.");
                    if (coverPreviewUrl) {
                      URL.revokeObjectURL(coverPreviewUrl);
                    }
                    setCoverPreviewUrl(null);
                    setCoverPreviewLoaded(false);
                    return;
                  }

                  const nextPreviewUrl = URL.createObjectURL(file);
                  if (coverPreviewUrl) {
                    URL.revokeObjectURL(coverPreviewUrl);
                  }
                  setCoverPreviewUrl(nextPreviewUrl);
                  setCoverPreviewLoaded(false);
                  setFileError(null);
                }}
                className="comic-input mt-4 bg-white file:mr-3 file:border-2 file:border-black file:bg-pop-yellow file:px-3 file:py-1.5 file:font-display file:text-xs file:text-ink-black file:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />

              <MotionStatus
                visible={Boolean(fileError)}
                className="mt-3 border-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-[3px_3px_0px_0px_rgba(185,28,28,0.25)]"
              >
                {fileError}
              </MotionStatus>

              <AnimatePresence initial={false}>
                {coverPreviewUrl || issue.cover_url ? (
                  <m.div
                    className="mt-4 overflow-hidden border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    initial={{ opacity: 0, y: 12, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.985 }}
                    transition={panelTransition}
                  >
                    <p className="mb-3 text-xs font-display tracking-[0.18em] text-slate-600">
                      {coverPreviewUrl ? "New Cover Preview" : "Current Cover"}
                    </p>
                    <div className="relative mx-auto aspect-2/3 w-44 overflow-hidden border-2 border-black bg-white">
                      {!coverPreviewLoaded ? <div className="comic-loading-sheen absolute inset-0" /> : null}
                      <m.img
                        key={coverPreviewUrl ?? issue.cover_url ?? issue.id}
                        src={coverPreviewUrl ?? issue.cover_url ?? ""}
                        alt="Issue cover preview"
                        onLoad={() => setCoverPreviewLoaded(true)}
                        className="h-full w-full object-cover"
                        initial={{ opacity: 0, scale: 1.03 }}
                        animate={{ opacity: coverPreviewLoaded ? 1 : 0.8, scale: coverPreviewLoaded ? 1 : 1.03 }}
                        transition={{ duration: 0.28 }}
                      />
                    </div>
                  </m.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-5">
            <div className={`${comicInsetCardClass} p-4`}>
              <p className="text-xs font-display tracking-[0.18em] text-slate-600">Issue Notes</p>
              <p className="mt-1 text-sm text-slate-500">
                Write notes with Markdown and review the rendered output in real time.
              </p>

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] font-display tracking-[0.18em] text-slate-600">Markdown Editor</span>
                  <textarea
                    ref={summaryRef}
                    name="summary"
                    rows={14}
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="## Plot Notes\n- Add continuity details\n- Mention heroes with @name or @[full name]"
                    className="comic-textarea bg-white"
                  />
                </label>

                <section className="space-y-2">
                  <p className="text-[11px] font-display tracking-[0.18em] text-slate-600">Live Preview</p>
                  <article className="min-h-full border-2 border-black bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                        a: ({ href, children }) => {
                          if (!href) {
                            return <span>{children}</span>;
                          }

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
                      {previewMarkdown.trim() ? previewMarkdown : "_No notes yet._"}
                    </ReactMarkdown>
                  </article>
                </section>
              </div>
            </div>

            <div className={`${comicInsetCardClass} p-4`}>
              <p className="text-xs font-display tracking-[0.18em] text-slate-600">Mention Characters</p>
              <p className="mt-1 text-sm text-slate-500">
                Search by full name or alias and insert the canonical character name into the summary. If you create a new one here, use the full display name you want stored.
              </p>

              <input
                type="text"
                value={mentionQuery}
                onChange={(event) => setMentionQuery(event.target.value)}
                placeholder="Search characters to mention..."
                className="comic-input mt-4"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {mentionQuery.trim() && !hasExactCharacterMatch && (
                  <m.button
                    type="button"
                    onClick={() => insertMention(mentionQuery)}
                    className="comic-chip bg-pop-yellow text-ink-black hover:bg-pop-yellow/80"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 1, scale: 0.985 }}
                    transition={springTransition}
                  >
                    Create {formatCharacterMention(mentionQuery)}
                  </m.button>
                )}
                {filteredCharacters.slice(0, 12).map((character) => (
                  <m.button
                    key={character.id}
                    type="button"
                    onClick={() => insertMention(character.alias || character.name)}
                    className="comic-chip bg-slate-50 text-slate-700 hover:bg-pop-yellow/20 hover:text-primary"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 1, scale: 0.985 }}
                    transition={springTransition}
                  >
                    @{character.name}
                    {character.alias ? ` · @${character.alias}` : ""}
                  </m.button>
                ))}
                {filteredCharacters.length === 0 && !mentionQuery.trim() && (
                  <p className="text-sm text-slate-500">Start typing to search the existing character list.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t-2 border-black pt-3">
              <m.button
                type="submit"
                formAction={deleteIssueAction}
                onClick={(e) => {
                  if (!confirm("Delete this issue? This action cannot be undone.")) {
                    e.preventDefault();
                    return;
                  }
                  close();
                }}
                className="comic-button-danger"
                whileHover={{ y: -2 }}
                whileTap={{ y: 1, scale: 0.985 }}
                transition={springTransition}
              >
                Delete
              </m.button>
              <m.button
                type="button"
                onClick={close}
                className="comic-button-secondary"
                whileHover={{ y: -2 }}
                whileTap={{ y: 1, scale: 0.985 }}
                transition={springTransition}
              >
                Cancel
              </m.button>
              <SaveChangesButton />
            </div>
          </div>
          </form>
        </m.div>
      </dialog>
    </>
  );
}
