import * as React from "react"
import { cn } from "@/lib/utils"

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-semibold uppercase tracking-[0.16em] text-[#52638b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-[#b7c6e7]",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
