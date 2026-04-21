import Link from "next/link";
import { BookOpenCheck, ContactRound, KanbanSquare, LibraryBig } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: BookOpenCheck },
  { href: "/titles", label: "Titles", icon: LibraryBig },
  { href: "/events", label: "Crossover", icon: KanbanSquare },
  { href: "/characters", label: "Characters", icon: ContactRound },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--card-line)] bg-[rgba(248,241,223,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group">
          <p className="text-2xl font-extrabold tracking-tight text-slate-950">
            Comicron
          </p>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#c44536] group-hover:text-[#18243a]">
            Collection Control Center
          </p>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 rounded-full border border-[color:var(--card-line)] bg-white/80 p-1.5 shadow-sm">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-[#18243a] hover:text-white"
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
