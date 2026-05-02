"use client";

import { BookPlus, CheckCircle2, ChevronDown, Upload } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { startTransition } from "react";
import { useRouter } from "next/navigation";

import { createIssueActionWithState, type CreateIssueFormState } from "@/app/actions";
import { MotionStatus, springTransition } from "@/components/ui/motion";

type QuickAddIssueFormProps = {
  titleId: string;
};

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
      className="comic-button-primary w-full"
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
      {pending ? "Creating..." : "Add Issue"}
    </m.button>
  );
}

export function QuickAddIssueForm({ titleId }: QuickAddIssueFormProps) {
  const router = useRouter();
  const [state, setState] = useState<CreateIssueFormState>(initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverPreviewLoaded, setCoverPreviewLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
      setCoverPreviewUrl(null);
      setCoverPreviewLoaded(false);
      setFileError(null);
      startTransition(() => {
        router.push(`/titles?title=${encodeURIComponent(titleId)}`, { scroll: false });
      });
    }
  }

  return (
    <div className="space-y-2">
      <m.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 border-2 border-black bg-pop-yellow px-3 py-2 font-display text-xs font-bold uppercase text-ink-black shadow-[2px_2px_0px_0px_black] hover:shadow-[4px_4px_0px_0px_black] transition-shadow"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="flex items-center gap-2">
          <BookPlus className="h-4 w-4" />
          Add Issue
        </span>
        <m.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </m.div>
      </m.button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <form ref={formRef} action={formAction} className="space-y-3 border-2 border-black bg-slate-50 p-3">
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
                {state.error}
              </MotionStatus>

              <MotionStatus
                visible={state.success}
                className="flex items-center gap-2 border-2 border-green-700 bg-green-50 px-3 py-2 text-sm text-green-700 shadow-[3px_3px_0px_0px_rgba(34,197,94,0.25)]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Issue created!
              </MotionStatus>

              <input type="hidden" name="title_id" value={titleId} />

              <div>
                <label className="flex items-center gap-2 text-xs font-display uppercase tracking-widest text-slate-600 mb-1.5 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Cover Image
                </label>
                <input
                  ref={fileInputRef}
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
                  className="comic-input text-sm file:mr-2 file:border-2 file:border-black file:bg-pop-yellow file:px-2 file:py-1 file:font-display file:text-xs file:text-ink-black file:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <AnimatePresence initial={false}>
                {coverPreviewUrl ? (
                  <m.div
                    className="overflow-hidden border-2 border-black bg-slate-100 p-2"
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="mb-2 text-xs font-display tracking-wide text-slate-600">Preview</p>
                    <div className="relative mx-auto aspect-2/3 w-24 overflow-hidden border-2 border-black bg-white">
                      {!coverPreviewLoaded ? <div className="comic-loading-sheen absolute inset-0" /> : null}
                      <m.img
                        key={coverPreviewUrl}
                        src={coverPreviewUrl}
                        alt="Preview cover"
                        onLoad={() => setCoverPreviewLoaded(true)}
                        className="h-full w-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: coverPreviewLoaded ? 1 : 0.8 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </m.div>
                ) : null}
              </AnimatePresence>

              <div className="grid gap-2">
                <div>
                  <label htmlFor="issue_number" className="block text-xs font-display uppercase tracking-widest text-slate-600">
                    Issue Number *
                  </label>
                  <input
                    type="text"
                    id="issue_number"
                    name="issue_number"
                    placeholder="e.g., 1, 42, 100.5"
                    required
                    className="comic-input mt-1 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="volume" className="block text-xs font-display uppercase tracking-widest text-slate-600">
                    Volume
                  </label>
                  <input
                    type="text"
                    id="volume"
                    name="volume"
                    placeholder="e.g., 1, 2"
                    className="comic-input mt-1 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="summary" className="block text-xs font-display uppercase tracking-widest text-slate-600">
                    Summary
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    placeholder="Brief summary (optional)"
                    rows={2}
                    className="comic-input mt-1 resize-none text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="reading_status" className="block text-xs font-display uppercase tracking-widest text-slate-600">
                    Status
                  </label>
                  <select
                    id="reading_status"
                    name="reading_status"
                    defaultValue="planned"
                    className="comic-input mt-1 text-sm"
                  >
                    <option value="planned">Planned</option>
                    <option value="reading">Reading</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>
              </div>

              <SubmitButton />
            </form>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
