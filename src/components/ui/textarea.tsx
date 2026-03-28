import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-[28px] border border-white/85 bg-[linear-gradient(155deg,rgba(255,255,255,0.84),rgba(245,248,255,0.72))] px-4 py-3 text-sm text-gray-900 shadow-[inset_1px_1px_0_rgba(255,255,255,0.85),10px_10px_20px_rgba(171,184,216,0.16)] outline-none transition focus:ring-2 focus:ring-[#c9dfff]/70 dark:border-[#263655] dark:bg-[linear-gradient(155deg,rgba(14,22,38,0.92),rgba(10,16,28,0.88))] dark:text-[#edf3ff] dark:placeholder:text-[#7f91ba]",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
