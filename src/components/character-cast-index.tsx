"use client";

/* eslint-disable @next/next/no-img-element */

import { m } from "framer-motion";
import { useMemo, useState } from "react";

import { CharacterProfileModal } from "@/components/character-profile-modal";
import { type CharacterProfileData } from "@/components/edit-character-modal";
import { springTransition } from "@/components/ui/motion";

type CharacterCastIndexProps = {
  characters: CharacterProfileData[];
};

export function CharacterCastIndex({ characters }: CharacterCastIndexProps) {
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);

  const activeCharacter = useMemo(
    () => characters.find((character) => character.id === activeCharacterId) ?? null,
    [activeCharacterId, characters],
  );

  return (
    <>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        {characters.map((character) => {
          const initials = (character.alias || character.name)
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("");

          return (
            <m.button
              key={character.id}
              type="button"
              onClick={() => setActiveCharacterId(character.id)}
              className="group flex min-h-24 items-center gap-3 border-2 border-black bg-white p-4 text-left shadow-[3px_3px_0px_0px_black] transition hover:-translate-y-0.5 hover:bg-pop-yellow/20"
              whileHover={{ y: -2 }}
              whileTap={{ y: 1, scale: 0.99 }}
              transition={springTransition}
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden border-2 border-black bg-slate-100">
                {character.avatar_url ? (
                  <img src={character.avatar_url} alt={character.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[14px_14px]">
                    <span className="font-display text-lg text-ink-black">{initials || "?"}</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 wrap-break-word font-display text-xl leading-tight text-ink-black">{character.name}</p>
                <p className="mt-1 line-clamp-2 wrap-break-word text-sm text-slate-600">Alias: {character.alias || "-"}</p>
              </div>
            </m.button>
          );
        })}

        {characters.length === 0 && (
          <p className="text-sm text-slate-500">No characters have been added yet.</p>
        )}
      </div>

      <CharacterProfileModal
        open={Boolean(activeCharacter)}
        character={activeCharacter}
        onClose={() => setActiveCharacterId(null)}
      />
    </>
  );
}
