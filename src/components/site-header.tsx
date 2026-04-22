"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, ContactRound, KanbanSquare, LibraryBig, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: BookOpenCheck },
  { href: "/titles", label: "Titles", icon: LibraryBig },
  { href: "/events", label: "Crossover", icon: KanbanSquare },
  { href: "/characters", label: "Characters", icon: ContactRound },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b-4 border-black bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.9))] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-4 border-black bg-white px-4 py-3 shadow-[8px_8px_0px_0px_black]">
          <Link href="/" className="group flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center border-4 border-dashed border-black bg-pop-yellow text-ink-black shadow-[4px_4px_0px_0px_black] sm:h-18 sm:w-18">
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.45)_0,rgba(255,255,255,0)_65%)]">
                <span className="font-display text-sm text-ink-black sm:text-base">Logo</span>
              </div>
            </div>

            <div className="min-w-0 space-y-1">
              <div className="inline-flex items-center gap-2 bg-pop-red px-2 py-1 text-white shadow-[3px_3px_0px_0px_black]">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-display text-[10px] tracking-wide">Collection HQ</span>
              </div>
              <p className="font-display text-3xl leading-none text-ink-black sm:text-[2rem]">Comicron</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 group-hover:text-primary">
                Library Command Deck
              </p>
            </div>
          </Link>

          <nav className="ml-auto flex flex-1 flex-wrap items-center justify-end gap-2 lg:max-w-[55%]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 border-2 border-black px-3 py-2 font-display text-[11px] tracking-wide text-ink-black shadow-[3px_3px_0px_0px_black] transition hover:-translate-y-0.5 hover:bg-pop-yellow hover:text-ink-black active:translate-y-0.5 active:shadow-none",
                    isActive ? "bg-pop-yellow text-ink-black" : "bg-white",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
