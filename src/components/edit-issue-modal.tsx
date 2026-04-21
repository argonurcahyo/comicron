"use client";

import { Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { deleteIssueAction, updateIssueAction } from "@/app/actions";
import { PublisherCombobox } from "@/components/publisher-combobox";
import { TitleCombobox } from "@/components/title-combobox";
import { comicInsetCardClass } from "@/components/ui/comic-card-styles";
import { formatCharacterMention } from "@/lib/character-mentions";

type TitleOption = { id: string; name: string };
type EventOption = { id: string; name: string };
type PublisherOption = { id: string; name: string };
type CharacterOption = { id: string; name: string; alias: string | null };

interface IssueData {
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

export function EditIssueModal({ issue, titles, events, publishers, characters }: EditIssueModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState(issue.summary ?? "");
  const [mentionQuery, setMentionQuery] = useState("");
  const normalizedQuery = mentionQuery.trim().toLowerCase();

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

  useEffect(() => {
    setSummary(issue.summary ?? "");
  }, [issue.id, issue.summary]);

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
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setFileError(null);
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
      setCoverPreviewUrl(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(960px,calc(100vw-2rem))] rounded-[28px] border border-card-line bg-white p-0 shadow-2xl backdrop:bg-slate-950/50"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Edit Issue</h2>
            <p className="mt-1 text-sm text-slate-500">Update metadata, replace the cover, and keep issue notes in one place.</p>
          </div>
          <button type="button" onClick={close} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          action={async (fd) => {
            await updateIssueAction(fd);
            close();
          }}
          className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <input type="hidden" name="issue_id" value={issue.id} />

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Series</p>
              <TitleCombobox
                titles={titles}
                defaultTitleId={issue.titleId}
                defaultTitleName={issue.titleName}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Publisher</p>
              <PublisherCombobox
                publishers={publishers}
                defaultPublisherId={issue.publisherId}
                defaultPublisherName={issue.publisherName}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Volume</span>
                <input
                  name="volume"
                  defaultValue={issue.volume ?? ""}
                  placeholder="Optional, e.g. Vol. 2"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Issue Number</span>
                <input
                  name="issue_number"
                  required
                  defaultValue={issue.issue_number}
                  placeholder="Issue number"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Reading Status</span>
                <select
                  name="reading_status"
                  defaultValue={issue.reading_status}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="planned">Planned</option>
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Crossover Event</span>
                <select
                  name="event_id"
                  defaultValue={issue.eventId ?? ""}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">No crossover event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Reading Order</span>
              <input
                name="reading_order"
                type="number"
                min={1}
                defaultValue={issue.readingOrder ?? ""}
                placeholder="Optional reading order inside the event"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cover Art</p>
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
                    return;
                  }

                  if (file.size > 8 * 1024 * 1024) {
                    event.currentTarget.value = "";
                    setFileError("Cover image is too large. Maximum file size is 8MB.");
                    if (coverPreviewUrl) {
                      URL.revokeObjectURL(coverPreviewUrl);
                    }
                    setCoverPreviewUrl(null);
                    return;
                  }

                  const nextPreviewUrl = URL.createObjectURL(file);
                  if (coverPreviewUrl) {
                    URL.revokeObjectURL(coverPreviewUrl);
                  }
                  setCoverPreviewUrl(nextPreviewUrl);
                  setFileError(null);
                }}
                className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />

              {fileError && (
                <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {fileError}
                </div>
              )}

              {(coverPreviewUrl || issue.cover_url) && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {coverPreviewUrl ? "New Cover Preview" : "Current Cover"}
                  </p>
                  <img
                    src={coverPreviewUrl ?? issue.cover_url ?? ""}
                    alt="Issue cover preview"
                    className="mx-auto aspect-2/3 w-44 rounded-xl object-cover shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className={`${comicInsetCardClass} p-4`}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Issue Notes</p>
              <p className="mt-1 text-sm text-slate-500">
                Keep the full summary here. Inline card editing is disabled so this is the single source of truth.
              </p>

              <textarea
                ref={summaryRef}
                name="summary"
                rows={12}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Add plot notes, continuity thoughts, and anything worth remembering about this issue..."
                className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-primary"
              />
            </div>

            <div className={`${comicInsetCardClass} p-4`}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Mention Characters</p>
              <p className="mt-1 text-sm text-slate-500">
                Search by full name or alias and insert the canonical character name into the summary. If you create a new one here, use the full display name you want stored.
              </p>

              <input
                type="text"
                value={mentionQuery}
                onChange={(event) => setMentionQuery(event.target.value)}
                placeholder="Search characters to mention..."
                className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {mentionQuery.trim() && !hasExactCharacterMatch && (
                  <button
                    type="button"
                    onClick={() => insertMention(mentionQuery)}
                    className="rounded-full border border-primary bg-[#fff4e6] px-3 py-1.5 text-xs font-semibold text-primary hover:brightness-95"
                  >
                    Create {formatCharacterMention(mentionQuery)}
                  </button>
                )}
                {filteredCharacters.slice(0, 12).map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => insertMention(character.name)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary"
                  >
                    @{character.name}
                    {character.alias ? ` · @${character.alias}` : ""}
                  </button>
                ))}
                {filteredCharacters.length === 0 && !mentionQuery.trim() && (
                  <p className="text-sm text-slate-500">Start typing to search the existing character list.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-2">
            <button
              type="submit"
              formAction={deleteIssueAction}
              onClick={(e) => {
                if (!confirm("Delete this issue? This action cannot be undone.")) {
                  e.preventDefault();
                  return;
                }
                close();
              }}
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
          </div>
        </form>
      </dialog>
    </>
  );
}
