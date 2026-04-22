"use client";

import { m } from "framer-motion";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <m.section
        className="comic-loading-sheen h-36 border-4 border-black bg-white shadow-[8px_8px_0px_0px_black]"
        initial={{ opacity: 0.55, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <m.div
          className="comic-loading-sheen h-80 border-2 border-black bg-white shadow-[4px_4px_0px_0px_black]"
          initial={{ opacity: 0.45, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, delay: 0.05 }}
        />
        <m.div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <m.div
              key={index}
              className="comic-loading-sheen h-56 border-2 border-black bg-white shadow-[3px_3px_0px_0px_black]"
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.25 }}
            />
          ))}
        </m.div>
      </div>
    </div>
  );
}