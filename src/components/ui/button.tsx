import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "danger"
  size?: "default" | "sm" | "lg"
}

export function buttonStyles({
  className,
  variant = "default",
  size = "default",
}: {
  className?: string
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
} = {}) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md border text-sm font-medium shadow-none transition duration-150 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-[#334155]",
    {
      "border-[#172033] bg-[#172033] text-white hover:bg-[#24304d] dark:border-[#f3f5f7] dark:bg-[#f3f5f7] dark:text-[#111827]": variant === "default",
      "border-gray-300 bg-white text-[#172033] hover:bg-gray-50 dark:border-[#334155] dark:bg-[#151c28] dark:text-[#f3f5f7] dark:hover:bg-[#1b2433]": variant === "outline",
      "border-transparent bg-transparent text-[#172033] hover:bg-gray-100 dark:text-[#f3f5f7] dark:hover:bg-[#1b2433]": variant === "ghost",
      "border-0 bg-transparent p-0 shadow-none underline-offset-4 hover:underline": variant === "link",
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200": variant === "danger",
      "h-11 px-6 py-2": size === "default",
      "h-9 px-4 text-xs": size === "sm",
      "h-12 px-8 text-base": size === "lg",
    },
    className
  )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonStyles({ className, variant, size })}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
