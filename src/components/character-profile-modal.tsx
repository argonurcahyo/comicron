"use client";

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, m } from "framer-motion";
import { Shield, User, Users, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";

import { EditCharacterModal, type CharacterProfileData } from "@/components/edit-character-modal";
import { panelTransition, springTransition } from "@/components/ui/motion";

type CharacterProfileModalProps = {
  open: boolean;
  onClose: () => void;
  character: CharacterProfileData | null;
};

export function CharacterProfileModal({ open, onClose, character }: CharacterProfileModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && character && !dialog.open) {
      dialog.showModal();
    } else if ((!open || !character) && dialog.open) {
      dialog.close();
    }
  }, [open, character]);

  if (!character) {
    return null;
  }

  const initials = (character.alias || character.name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto h-[min(680px,calc(100vh-2rem))] w-[min(920px,calc(100vw-2rem))] overflow-hidden border-4 border-black bg-white p-0 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] backdrop:bg-slate-950/55"
    >
      <m.div
        key={open ? `open-${character.id}` : `closed-${character.id}`}
        initial={open ? { opacity: 0, y: 14, scale: 0.985 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={panelTransition}
        className="flex h-full flex-col"
      >
        <div className="flex items-start justify-between gap-4 border-b-4 border-black bg-pop-yellow px-5 py-4">
          <div>
            <p className="text-[10px] font-display tracking-[0.2em] text-ink-black/65">CHARACTER PROFILE</p>
            <h2 className="mt-1 font-display text-3xl leading-tight text-ink-black">{character.alias || character.name}</h2>
            {character.alias && character.alias !== character.name ? (
              <p className="mt-1 text-sm text-slate-700">Real name: {character.name}</p>
            ) : null}
          </div>

          <m.button
            type="button"
            onClick={onClose}
            className="comic-button-secondary shrink-0 px-2 py-2"
            whileHover={{ y: -2 }}
            whileTap={{ y: 1, scale: 0.985 }}
            transition={springTransition}
          >
            <X className="h-4 w-4" />
          </m.button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 sm:grid-cols-[300px_1fr]">
          <div className="border-b-4 border-black bg-slate-50 p-4 sm:border-b-0 sm:border-r-4">
            <div className="mx-auto aspect-square w-full max-w-55 overflow-hidden border-4 border-black bg-white shadow-[6px_6px_0px_0px_black]">
              {character.avatar_url ? (
                // Use native img so external avatar URLs work without Next image domain config.
                <img
                  src={character.avatar_url}
                  alt={character.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[16px_16px]">
                  <span className="font-display text-3xl text-ink-black">{initials || "?"}</span>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2">
                <Shield className="h-4 w-4" />
                <span>Status: {character.status || "-"}</span>
              </div>
              <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2">
                <Users className="h-4 w-4" />
                <span>Affiliation: {character.affiliation || "-"}</span>
              </div>
              <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2">
                <User className="h-4 w-4" />
                <span>ID: {character.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex items-center justify-between gap-3 border-b-2 border-black px-5 py-3">
              <p className="text-xs font-display tracking-[0.18em] text-slate-500">LORE / CONTINUITY NOTES</p>
              <EditCharacterModal character={character} buttonLabel="Edit Character" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <AnimatePresence mode="wait">
                <m.div
                  key={`lore-${character.id}-${character.lore_markdown?.length ?? 0}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={panelTransition}
                  className="prose prose-slate max-w-none"
                >
                  {character.lore_markdown?.trim() ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{character.lore_markdown}</ReactMarkdown>
                  ) : (
                    <p className="text-sm italic text-slate-400">No lore notes yet. Click Edit Character to add details.</p>
                  )}
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </m.div>
    </dialog>
  );
}
