"use client";

import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";

import { DropdownSurface, dropdownTransition } from "@/components/ui/motion";

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
        className="comic-input"
        autoComplete="off"
      />

      <input type="hidden" name="publisher_id" value={selectedId} />
      <input type="hidden" name="new_publisher_name" value={selectedId ? "" : query} />

      <AnimatePresence>
        {open && (filtered.length > 0 || showCreateOption) ? (
          <DropdownSurface className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            {filtered.slice(0, 10).map((p, index) => (
              <m.li
                key={p.id}
                onMouseDown={() => selectPublisher(p.id, p.name)}
                className="cursor-pointer border-b border-slate-200 px-3 py-2 text-sm text-ink-black hover:bg-pop-yellow/20"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ ...dropdownTransition, delay: index * 0.02 }}
              >
                {p.name}
              </m.li>
            ))}
            {showCreateOption ? (
              <m.li
                onMouseDown={() => {
                  setSelectedId("");
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-1 border-t-2 border-black bg-pop-yellow/20 px-3 py-2 text-sm font-semibold text-primary hover:bg-pop-yellow/35"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={dropdownTransition}
              >
                <span className="font-semibold">+</span> Create publisher:{" "}
                <span className="font-semibold">&ldquo;{query}&rdquo;</span>
              </m.li>
            ) : null}
          </DropdownSurface>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
