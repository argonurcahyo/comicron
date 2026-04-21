"use client";

import { useState } from "react";

type PublisherOption = { id: string; name: string };

interface PublisherComboboxProps {
  publishers: PublisherOption[];
  defaultPublisherId?: string;
  defaultPublisherName?: string;
}

export function PublisherCombobox({
  publishers,
  defaultPublisherId = "",
  defaultPublisherName = "",
}: PublisherComboboxProps) {
  const [query, setQuery] = useState(defaultPublisherName);
  const [selectedId, setSelectedId] = useState(defaultPublisherId);
  const [open, setOpen] = useState(false);

  const filtered =
    query.length === 0
      ? publishers
      : publishers.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const exactMatch = publishers.find((p) => p.name.toLowerCase() === query.toLowerCase());
  const showCreateOption = query.length > 0 && !exactMatch;

  function selectPublisher(id: string, name: string) {
    setSelectedId(id);
    setQuery(name);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedId("");
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search publishers like Marvel, DC, or Image..."
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
        autoComplete="off"
      />

      <input type="hidden" name="publisher_id" value={selectedId} />
      <input type="hidden" name="new_publisher_name" value={selectedId ? "" : query} />

      {open && (filtered.length > 0 || showCreateOption) && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {filtered.slice(0, 10).map((p) => (
            <li
              key={p.id}
              onMouseDown={() => selectPublisher(p.id, p.name)}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-100"
            >
              {p.name}
            </li>
          ))}
          {showCreateOption && (
            <li
              onMouseDown={() => {
                setSelectedId("");
                setOpen(false);
              }}
              className="flex cursor-pointer items-center gap-1 border-t border-slate-100 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
            >
              <span className="font-semibold">+</span> Create publisher:{" "}
              <span className="font-semibold">&ldquo;{query}&rdquo;</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
