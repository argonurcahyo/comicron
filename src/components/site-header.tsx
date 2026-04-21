import Link from "next/link";
import { BookOpenCheck, ContactRound, KanbanSquare } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: BookOpenCheck },
  { href: "/events", label: "Crossover", icon: KanbanSquare },
  { href: "/characters", label: "Characters", icon: ContactRound },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-300 bg-[#f6f0e8]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group">
          <p className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Comicron
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-rose-700 group-hover:text-rose-900">
            Comic Book Tracker
          </p>
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-rose-500 hover:text-rose-700"
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
