"use client";

import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import type { ComponentProps } from "react";
import { useState } from "react";

import { panelTransition } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

type AnimatedCoverImageProps = Omit<ComponentProps<typeof Image>, "alt"> & {
  alt: string;
  wrapperClassName?: string;
  overlayClassName?: string;
};

export function AnimatedCoverImage({
  alt,
  className,
  wrapperClassName,
  overlayClassName,
  onLoad,
  priority,
  ...props
}: AnimatedCoverImageProps) {
  const [loaded, setLoaded] = useState(Boolean(priority));

  return (
    <div className={cn("relative h-full w-full overflow-hidden", wrapperClassName)}>
      <Image
        {...props}
        alt={alt}
        priority={priority}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        className={cn(
          "object-cover transition-[transform,filter] duration-700 ease-out",
          loaded ? "scale-100 blur-0" : "scale-105 blur-[2px]",
          className,
        )}
      />
      <AnimatePresence initial={false}>
        {!loaded ? (
          <m.div
            className={cn("comic-loading-sheen absolute inset-0", overlayClassName)}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={panelTransition}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}