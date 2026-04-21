import * as React from "react";

import { cn } from "@/lib/utils";

type AlertProps = React.ComponentProps<"div"> & {
  variant?: "default" | "destructive";
};

function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(
        "relative w-full rounded-xl border px-4 py-3 text-sm",
        variant === "destructive" ? "border-red-300 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-900",
        className,
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return <h5 data-slot="alert-title" className={cn("mb-1 font-semibold leading-none", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("text-sm", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
