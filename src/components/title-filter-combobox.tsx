"use client";

import { AnimatePresence, m } from "framer-motion";
import { Search } from "lucide-react";
import { startTransition, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { DropdownSurface, dropdownTransition } from "@/components/ui/motion";

type TitleFilterOption = {
  id: string;
  name: string;
  publisher: string | null;
  issueCount: number;
};

type TitleFilterComboboxProps = {
  titles: TitleFilterOption[];
  selectedTitleId?: string;
};

export function TitleFilterCombobox({ titles, selectedTitleId = "" }: TitleFilterComboboxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const selectedTitle = titles.find((title) => title.id === selectedTitleId) ?? titles[0] ?? null;

  const [query, setQuery] = useState(selectedTitle?.name ?? "");
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTitles = normalizedQuery
    ? titles.filter((title) => {
        const publisher = title.publisher?.toLowerCase() ?? "";
        return title.name.toLowerCase().includes(normalizedQuery) || publisher.includes(normalizedQuery);
      })
    : titles;

  function navigateToTitle(titleId: string) {
    if (!titleId) {
      return;
    }

    setIsPending(true);
    setOpen(false);

    startTransition(() => {
      router.push(`${pathname}?title=${encodeURIComponent(titleId)}`, { scroll: false });
    });
  }

  return (
    <div className="relative">
      <label className="block space-y-1.5 text-sm text-slate-700">
        <span className="text-xs font-display uppercase tracking-widest text-slate-600">Select Title</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                const nextTitle = filteredTitles[0];
                if (nextTitle) {
                  navigateToTitle(nextTitle.id);
                }
              }
            }}
            placeholder="Search title or publisher..."
            autoComplete="off"
            className="comic-input pl-10 pr-4"
          />
        </div>
      </label>

      <AnimatePresence>
        {open && filteredTitles.length > 0 ? (
          <DropdownSurface className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            {filteredTitles.slice(0, 12).map((title, index) => {
              const isActive = title.id === selectedTitleId;

              return (
                <m.li
                  key={title.id}
                  onMouseDown={() => {
                    setQuery(title.name);
                    navigateToTitle(title.id);
                  }}
                  className={[
                    "cursor-pointer border-b border-slate-200 px-3 py-2.5 text-sm text-ink-black",
                    isActive ? "bg-pop-yellow/25" : "hover:bg-pop-yellow/20",
                  ].join(" ")}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ ...dropdownTransition, delay: index * 0.02 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-base text-ink-black">{title.name}</p>
                      <p className="truncate text-xs text-slate-600">{title.publisher ?? "Publisher not set"}</p>
                    </div>
                    <span className="shrink-0 border border-black bg-white px-1.5 py-0.5 font-display text-[10px] text-ink-black">
                      {title.issueCount}
                    </span>
                  </div>
                </m.li>
              );
            })}
          </DropdownSurface>
        ) : null}
      </AnimatePresence>

      <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-500">
        <span className="font-display">{titles.length} results indexed</span>
        {isPending ? (
          <m.span
            className="inline-block h-2 w-2 rounded-full bg-primary"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        ) : null}
      </div>
    </div>
  );
}
