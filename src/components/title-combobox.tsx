"use client";

import { useRef, useState } from "react";

type TitleOption = { id: string; name: string };

interface TitleComboboxProps {
  titles: TitleOption[];
  defaultTitleId?: string;
  defaultTitleName?: string;
}

export function TitleCombobox({ titles, defaultTitleId = "", defaultTitleName = "" }: TitleComboboxProps) {
  const [query, setQuery] = useState(defaultTitleName);
  const [selectedId, setSelectedId] = useState(defaultTitleId);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    query.length === 0
      ? titles
      : titles.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  const exactMatch = titles.find((t) => t.name.toLowerCase() === query.toLowerCase());
  const showCreateOption = query.length > 0 && !exactMatch;

  function selectTitle(id: string, name: string) {
    setSelectedId(id);
    setQuery(name);
    setOpen(false);
  }

  function handleInput(value: string) {
    setQuery(value);
    setSelectedId("");
    setOpen(true);
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search titles or type a new series..."
        className="comic-input"
        autoComplete="off"
      />
      {/* Values consumed by Server Actions */}
      <input type="hidden" name="title_id" value={selectedId} />
      <input type="hidden" name="new_title_name" value={selectedId ? "" : query} />

      {open && (filtered.length > 0 || showCreateOption) && (
        <ul className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {filtered.slice(0, 10).map((t) => (
            <li
              key={t.id}
              onMouseDown={() => selectTitle(t.id, t.name)}
              className="cursor-pointer border-b border-slate-200 px-3 py-2 text-sm text-ink-black hover:bg-pop-yellow/20"
            >
              {t.name}
            </li>
          ))}
          {showCreateOption && (
            <li
              onMouseDown={() => {
                setSelectedId("");
                setOpen(false);
              }}
              className="flex cursor-pointer items-center gap-1 border-t-2 border-black bg-pop-yellow/20 px-3 py-2 text-sm font-semibold text-primary hover:bg-pop-yellow/35"
            >
              <span className="font-semibold">+</span> Create new:{" "}
              <span className="font-semibold">&ldquo;{query}&rdquo;</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
