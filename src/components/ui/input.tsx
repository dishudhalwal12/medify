import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[24px] border border-white/85 bg-[linear-gradient(155deg,rgba(255,255,255,0.84),rgba(245,248,255,0.72))] px-4 py-2 text-sm shadow-[inset_1px_1px_0_rgba(255,255,255,0.85),10px_10px_20px_rgba(171,184,216,0.16)] transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#7b86a5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9dfff]/70 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#263655] dark:bg-[linear-gradient(155deg,rgba(14,22,38,0.92),rgba(10,16,28,0.88))] dark:text-[#edf3ff] dark:placeholder:text-[#7f91ba]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
