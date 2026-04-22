"use client";

import { BookPlus, CalendarRange, Hash, Layers3, ScrollText } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { createIssueActionWithState, type CreateIssueFormState } from "@/app/actions";
import { EventCombobox } from "@/components/event-combobox";
import { PublisherCombobox } from "@/components/publisher-combobox";
import { TitleCombobox } from "@/components/title-combobox";

type TitleOption = { id: string; name: string };
type EventOption = { id: string; name: string };
type PublisherOption = { id: string; name: string };

interface CreateIssueFormProps {
  titles: TitleOption[];
  events: EventOption[];
  publishers: PublisherOption[];
}

const initialState: CreateIssueFormState = {
  error: null,
  success: false,
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="comic-button-primary"
    >
      <BookPlus className="h-4 w-4" />
      {pending ? "Saving..." : "Add Issue"}
    </button>
  );
}

export function CreateIssueForm({ titles, events, publishers }: CreateIssueFormProps) {
  const [state, formAction] = useActionState(createIssueActionWithState, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
      setCoverPreviewUrl(null);
      setFileError(null);
    }
  }, [state.success, coverPreviewUrl]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3">
      {fileError && (
        <div className="border-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-[3px_3px_0px_0px_rgba(185,28,28,0.25)]">
          {fileError}
        </div>
      )}
      {state.error && (
        <div className="border-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-[3px_3px_0px_0px_rgba(185,28,28,0.25)]">
          Could not save issue: {state.error}
        </div>
      )}

      <TitleCombobox titles={titles} />
      <PublisherCombobox publishers={publishers} />

      <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2 text-xs font-display text-slate-600">
            <Layers3 className="h-3.5 w-3.5" />
            Volume
          </span>
          <input
            name="volume"
            placeholder="Vol. 2"
            className="comic-input py-2 pl-3 pr-3"
          />
        </label>

        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2 text-xs font-display text-slate-600">
            <Hash className="h-3.5 w-3.5" />
            Issue
          </span>
          <input
            name="issue_number"
            required
            placeholder="15"
            className="comic-input py-2 pl-3 pr-3"
          />
        </label>

        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2 text-xs font-display text-slate-600">
            <CalendarRange className="h-3.5 w-3.5" />
            Crossover Event
          </span>
          <EventCombobox events={events} />
        </label>
      </div>

      <select
        name="reading_status"
        defaultValue="planned"
        className="comic-select"
      >
        <option value="planned">Planned</option>
        <option value="reading">Reading</option>
        <option value="completed">Completed</option>
        <option value="dropped">Dropped</option>
      </select>

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

          if (file.size > MAX_UPLOAD_BYTES) {
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
        className="comic-input bg-white file:mr-3 file:border-2 file:border-black file:bg-pop-yellow file:px-3 file:py-1.5 file:font-display file:text-xs file:text-ink-black file:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      />
      {coverPreviewUrl && (
        <div className="overflow-hidden border-2 border-black bg-slate-50 p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <p className="mb-2 text-xs font-display tracking-wide text-slate-600">Preview Cover</p>
          <img
            src={coverPreviewUrl}
            alt="Preview cover issue"
            className="mx-auto aspect-2/3 w-40 border-2 border-black object-cover"
          />
        </div>
      )}
      <textarea
        name="summary"
        rows={3}
        placeholder="Optional short summary. Use full edit later for detailed notes and character mentions."
        className="comic-textarea"
      />

      <SubmitButton />
    </form>
  );
}
