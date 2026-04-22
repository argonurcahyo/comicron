"use client";

import { LoaderCircle } from "lucide-react";
import { m } from "framer-motion";
import { useFormStatus } from "react-dom";

import { springTransition } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface FormSubmitButtonProps {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}

export function FormSubmitButton({ idleLabel, pendingLabel, className }: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <m.button
      type="submit"
      disabled={pending}
      whileHover={pending ? undefined : { y: -2 }}
      whileTap={pending ? undefined : { y: 1, scale: 0.985 }}
      transition={springTransition}
      className={cn(
        "inline-flex items-center justify-center gap-2 border-2 border-black bg-pop-yellow px-4 py-2 font-display text-sm text-ink-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      <span>{pending ? pendingLabel : idleLabel}</span>
      {pending ? (
        <m.span
          className="h-2 w-2 rounded-full bg-primary"
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.92, 1.08, 0.92] }}
          transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      ) : null}
    </m.button>
  );
}