"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, ContactRound, KanbanSquare, LibraryBig, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { panelTransition, springTransition } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: BookOpenCheck },
  { href: "/titles", label: "Titles", icon: LibraryBig },
  { href: "/events", label: "Crossover", icon: KanbanSquare },
  { href: "/characters", label: "Characters", icon: ContactRound },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-hide on scroll down, reveal on scroll up
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setVisible(true);
      } else {
        setVisible(currentY < lastScrollY.current);
      }
      lastScrollY.current = currentY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <m.header
        className="fixed inset-x-0 top-0 z-40 border-b-4 border-black bg-white/95 backdrop-blur-xl"
        animate={{ y: visible ? 0 : "-110%", opacity: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        initial={{ y: -14, opacity: 0 }}
      >
        <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">

          {/* Logo — compact */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <m.div
              className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-dashed border-black bg-pop-yellow shadow-[2px_2px_0px_0px_black]"
              whileHover={{ rotate: -6, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
            >
              <span className="font-display text-[10px] text-ink-black">C</span>
            </m.div>
            <span className="font-display text-lg leading-none text-ink-black group-hover:text-primary">
              Comicron
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <m.div key={item.href} whileHover={{ y: -2 }} whileTap={{ y: 1, scale: 0.985 }} transition={springTransition}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative inline-flex items-center gap-1.5 overflow-hidden border-2 border-black px-3 py-1.5 font-display text-[11px] tracking-wide text-ink-black shadow-[2px_2px_0px_0px_black] transition active:shadow-none",
                      isActive ? "text-ink-black" : "bg-white",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive ? (
                      <m.span
                        layoutId="site-header-active-nav"
                        className="absolute inset-0 bg-pop-yellow"
                        transition={springTransition}
                      />
                    ) : null}
                    <span className="relative inline-flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                  </Link>
                </m.div>
              );
            })}
          </nav>

          {/* Mobile burger */}
          <m.button
            className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_black] sm:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            whileTap={{ scale: 0.9 }}
            transition={springTransition}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <m.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="h-4 w-4" />
                </m.span>
              ) : (
                <m.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="h-4 w-4" />
                </m.span>
              )}
            </AnimatePresence>
          </m.button>
        </div>

        {/* Mobile nav drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <m.nav
              key="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={panelTransition}
              className="overflow-hidden border-t-2 border-black sm:hidden"
            >
              <div className="flex flex-col divide-y-2 divide-black">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3 font-display text-xs tracking-wide text-ink-black",
                        isActive ? "bg-pop-yellow" : "bg-white hover:bg-slate-50",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </m.header>

      {/* Spacer so content isn't occluded by fixed header */}
      <div className="h-12" />
    </>
  );
}
