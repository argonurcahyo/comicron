"use client";

import { m } from "framer-motion";
import { Suspense, ReactNode } from "react";

type TitlesIssuesSectionProps = {
  selectedTitleId?: string;
  selectedVolume?: string;
  selectedTitle: {
    id: string;
    name: string;
    publisher: string | null;
  } | null;
  children: ReactNode;
  fallback: ReactNode;
};

export function TitlesIssuesSection({
  selectedTitleId,
  selectedVolume,
  selectedTitle,
  children,
  fallback,
}: TitlesIssuesSectionProps) {
  return (
    <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_black]">
      {!selectedTitle ? (
        <p className="mt-4 text-sm text-slate-500">Choose a title to inspect the issues in that run.</p>
      ) : (
        <Suspense
          key={`${selectedTitleId}-${selectedVolume}`}
          fallback={
            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {fallback}
            </m.div>
          }
        >
          <m.div
            key={`content-${selectedTitleId}-${selectedVolume}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </m.div>
        </Suspense>
      )}
    </section>
  );
}
