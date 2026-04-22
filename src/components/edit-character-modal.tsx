"use client";

import { m } from "framer-motion";
import { Maximize2, Minimize2, Pencil, X } from "lucide-react";
import { useRef, useState } from "react";

import { updateCharacterProfileAction } from "@/app/actions";
import { MarkdownEditor } from "@/components/markdown-editor";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { panelTransition, springTransition } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export type CharacterProfileData = {
  id: string;
  name: string;
  alias: string | null;
  status: string | null;
  affiliation: string | null;
  lore_markdown: string | null;
  avatar_url: string | null;
};

type EditCharacterModalProps = {
  character: CharacterProfileData;
  buttonLabel?: string;
  className?: string;
};

export function EditCharacterModal({ character, buttonLabel = "Edit", className }: EditCharacterModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  function open() {
    setIsOpen(true);
    dialogRef.current?.showModal();
  }

  function close() {
    setIsOpen(false);
    setIsFullscreen(false);
    dialogRef.current?.close();
  }

  return (
    <>
      <m.button
        type="button"
        onClick={open}
        className={cn("comic-button-secondary px-3 py-1.5 text-xs", className)}
        whileHover={{ y: -2 }}
        whileTap={{ y: 1, scale: 0.985 }}
        transition={springTransition}
      >
        <Pencil className="h-3 w-3" />
        {buttonLabel}
      </m.button>

      <dialog
        ref={dialogRef}
        className={cn(
          "m-auto overflow-hidden border-4 border-black bg-white p-0 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] backdrop:bg-slate-950/50",
          isFullscreen
            ? "h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none"
            : "max-h-[calc(100vh-2rem)] w-[min(980px,calc(100vw-2rem))]",
        )}
      >
        <m.div
          key={`${character.id}-${isOpen ? "open" : "closed"}-${isFullscreen ? "fullscreen" : "windowed"}`}
          initial={isOpen ? { opacity: 0, y: 18, scale: 0.985 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={panelTransition}
        >
          <div className="flex items-center justify-between border-b-4 border-black bg-pop-yellow px-6 py-4">
            <div>
              <h2 className="font-display text-xl text-ink-black">Edit Character</h2>
              <p className="mt-1 text-sm text-slate-700">Update profile details and lore notes.</p>
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
            key={character.id}
            action={async (fd) => {
              await updateCharacterProfileAction(fd);
              close();
            }}
            className={cn(
              "grid gap-5 overflow-y-auto p-6",
              isFullscreen ? "h-[calc(100%-85px)]" : "max-h-[calc(100vh-8rem)]",
            )}
          >
            <input type="hidden" name="character_id" value={character.id} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-slate-700 sm:col-span-2">
                Name
                <input
                  name="name"
                  required
                  defaultValue={character.name}
                  className="comic-input"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-700">
                Alias
                <input
                  name="alias"
                  defaultValue={character.alias ?? ""}
                  className="comic-input"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-700">
                Status
                <input
                  name="status"
                  defaultValue={character.status ?? "active"}
                  className="comic-input"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-700">
                Affiliation
                <input
                  name="affiliation"
                  defaultValue={character.affiliation ?? ""}
                  className="comic-input"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-700">
                Avatar URL
                <input
                  name="avatar_url"
                  type="url"
                  defaultValue={character.avatar_url ?? ""}
                  placeholder="https://..."
                  className="comic-input"
                />
              </label>
            </div>

            <MarkdownEditor
              name="lore_markdown"
              initialValue={character.lore_markdown ?? ""}
            />

            <div className="flex items-center gap-3">
              <FormSubmitButton idleLabel="Save Character" pendingLabel="Saving..." />
            </div>
          </form>
        </m.div>
      </dialog>
    </>
  );
}
