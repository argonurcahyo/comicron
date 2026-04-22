"use client";

import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";

import { DropdownSurface, dropdownTransition } from "@/components/ui/motion";

type EventOption = { id: string; name: string };

interface EventComboboxProps {
  events: EventOption[];
  defaultEventId?: string;
  defaultEventName?: string;
}

export function EventCombobox({
  events,
  defaultEventId = "",
  defaultEventName = "",
}: EventComboboxProps) {
  const [query, setQuery] = useState(defaultEventName);
  const [selectedId, setSelectedId] = useState(defaultEventId);
  const [open, setOpen] = useState(false);

  const filtered =
    query.length === 0 ? events : events.filter((event) => event.name.toLowerCase().includes(query.toLowerCase()));

  const exactMatch = events.find((event) => event.name.toLowerCase() === query.toLowerCase());
  const showCreateOption = query.length > 0 && !exactMatch;

  function selectEvent(id: string, name: string) {
    setSelectedId(id);
    setQuery(name);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelectedId("");
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search or create a crossover event..."
        className="comic-input"
        autoComplete="off"
      />

      <input type="hidden" name="event_id" value={selectedId} />
      <input type="hidden" name="new_event_name" value={selectedId ? "" : query} />

      <AnimatePresence>
        {open && (filtered.length > 0 || showCreateOption) ? (
          <DropdownSurface className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <m.li
              onMouseDown={() => selectEvent("", "")}
              className="cursor-pointer border-b border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={dropdownTransition}
            >
              No crossover event
            </m.li>
            {filtered.slice(0, 10).map((event, index) => (
              <m.li
                key={event.id}
                onMouseDown={() => selectEvent(event.id, event.name)}
                className="cursor-pointer border-b border-slate-200 px-3 py-2 text-sm text-ink-black hover:bg-pop-yellow/20"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ ...dropdownTransition, delay: (index + 1) * 0.02 }}
              >
                {event.name}
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
                <span className="font-semibold">+</span> Create event: <span className="font-semibold">&ldquo;{query}&rdquo;</span>
              </m.li>
            ) : null}
          </DropdownSurface>
        ) : null}
      </AnimatePresence>
    </div>
  );
}