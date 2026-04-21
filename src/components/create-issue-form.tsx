"use client";

import { BookPlus } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { createIssueActionWithState, type CreateIssueFormState } from "@/app/actions";
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
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {fileError}
        </div>
      )}
      {state.error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not save issue: {state.error}
        </div>
      )}

      <TitleCombobox titles={titles} />
      <PublisherCombobox publishers={publishers} />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="volume"
          placeholder="Volume (optional, e.g. Vol. 2)"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="issue_number"
          required
          placeholder="Issue number (e.g. 15)"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <select
        name="reading_status"
        defaultValue="planned"
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        <option value="planned">Planned</option>
        <option value="reading">Reading</option>
        <option value="completed">Completed</option>
        <option value="dropped">Dropped</option>
      </select>

      <div className="grid gap-3 sm:grid-cols-2">
        <select name="event_id" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">No crossover event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
        <input
          name="reading_order"
          type="number"
          min={1}
          placeholder="Reading order (optional)"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
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
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
      />
      {coverPreviewUrl && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Preview Cover</p>
          <img
            src={coverPreviewUrl}
            alt="Preview cover issue"
            className="mx-auto aspect-2/3 w-40 rounded-lg object-cover"
          />
        </div>
      )}
      <textarea
        name="summary"
        rows={3}
        placeholder="Optional short summary. Use full edit later for detailed notes and character mentions."
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
      />

      <SubmitButton />
    </form>
  );
}
