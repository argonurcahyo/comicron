"use client";

import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

export const panelTransition = {
  duration: 0.32,
  ease: easeOut,
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 24,
  mass: 0.9,
};

export const dropdownTransition = {
  duration: 0.18,
  ease: easeOut,
};

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

export function RouteTransition({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false} mode="wait">
      <m.div
        key={pathname}
        className={className}
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -10, filter: "blur(4px)" }}
        transition={panelTransition}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ ...panelTransition, delay }}
    >
      {children}
    </m.div>
  );
}

export function MotionStatus({
  visible,
  children,
  className,
}: {
  visible: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <m.div
          className={className}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={panelTransition}
        >
          {children}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

export function DropdownSurface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.ul
      className={cn(className)}
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={dropdownTransition}
    >
      {children}
    </m.ul>
  );
}