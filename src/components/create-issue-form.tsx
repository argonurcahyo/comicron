"use client";

import { AnimatePresence, m } from "framer-motion";
import { BookPlus, CalendarRange, CheckCircle2, Hash, Layers3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { createIssueActionWithState, type CreateIssueFormState } from "@/app/actions";
import { EventCombobox } from "@/components/event-combobox";
import { PublisherCombobox } from "@/components/publisher-combobox";
import { TitleCombobox } from "@/components/title-combobox";
import { MotionStatus, springTransition } from "@/components/ui/motion";

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
    <m.button
      type="submit"
      disabled={pending}
      className="comic-button-primary"
      whileHover={pending ? undefined : { y: -2 }}
      whileTap={pending ? undefined : { y: 1, scale: 0.985 }}
      transition={springTransition}
    >
      <m.span
        animate={pending ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }}
        transition={pending ? { duration: 0.8, repeat: Number.POSITIVE_INFINITY } : { duration: 0.2 }}
      >
        <BookPlus className="h-4 w-4" />
      </m.span>
      {pending ? "Saving Issue..." : "Add Issue"}
      {pending ? (
        <m.span
          className="h-2 w-2 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.08, 0.9] }}
          transition={{ duration: 0.85, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      ) : null}
    </m.button>
  );
}

export function CreateIssueForm({ titles, events, publishers }: CreateIssueFormProps) {
  const [state, setState] = useState<CreateIssueFormState>(initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverPreviewLoaded, setCoverPreviewLoaded] = useState(false);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  async function formAction(formData: FormData) {
    const nextState = await createIssueActionWithState(state, formData);

    setState(nextState);

    if (nextState.success) {
      formRef.current?.reset();
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
      setCoverPreviewUrl(null);
      setCoverPreviewLoaded(false);
      setFileError(null);
    }
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-3">
      <MotionStatus
        visible={Boolean(fileError)}
        className="border-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-[3px_3px_0px_0px_rgba(185,28,28,0.25)]"
      >
        {fileError}
      </MotionStatus>
      <MotionStatus
        visible={Boolean(state.error)}
        className="border-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-[3px_3px_0px_0px_rgba(185,28,28,0.25)]"
      >
        Could not save issue: {state.error}
      </MotionStatus>
      <MotionStatus
        visible={state.success}
        className="flex items-center gap-2 border-2 border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 shadow-[3px_3px_0px_0px_rgba(16,185,129,0.22)]"
      >
        <CheckCircle2 className="h-4 w-4" />
        Issue added to the collection.
      </MotionStatus>

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
        className="comic-input bg-white file:mr-3 file:border-2 file:border-black file:bg-pop-yellow file:px-3 file:py-1.5 file:font-display file:text-xs file:text-ink-black file:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      />
      <AnimatePresence initial={false}>
        {coverPreviewUrl ? (
          <m.div
            className="overflow-hidden border-2 border-black bg-slate-50 p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.24 }}
          >
            <p className="mb-2 text-xs font-display tracking-wide text-slate-600">Preview Cover</p>
            <div className="relative mx-auto aspect-2/3 w-40 overflow-hidden border-2 border-black bg-white">
              {!coverPreviewLoaded ? <div className="comic-loading-sheen absolute inset-0" /> : null}
              <m.img
                key={coverPreviewUrl}
                src={coverPreviewUrl}
                alt="Preview cover issue"
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
