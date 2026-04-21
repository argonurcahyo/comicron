import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline";
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        variant === "secondary" && "border-slate-200 bg-slate-100 text-slate-700",
        variant === "outline" && "border-slate-300 bg-transparent text-slate-700",
        variant === "default" && "border-rose-200 bg-rose-50 text-rose-700",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
