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
    "inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/85 text-sm font-semibold text-[#24304d] shadow-[8px_8px_18px_rgba(170,184,217,0.14),-4px_-4px_12px_rgba(255,255,255,0.74)] transition duration-150 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9dfff]/70 disabled:pointer-events-none disabled:opacity-50 dark:border-[#263655] dark:text-[#edf3ff] dark:shadow-[8px_8px_18px_rgba(2,6,15,0.24)]",
    {
      "bg-[linear-gradient(155deg,rgba(255,223,211,0.95),rgba(255,245,240,0.9))] hover:bg-[linear-gradient(155deg,rgba(255,229,219,0.98),rgba(255,248,243,0.92))] dark:bg-[linear-gradient(155deg,rgba(53,72,122,0.96),rgba(24,37,64,0.92))] dark:hover:bg-[linear-gradient(155deg,rgba(61,81,136,0.98),rgba(29,45,76,0.94))]": variant === "default",
      "bg-[linear-gradient(155deg,rgba(255,255,255,0.72),rgba(241,246,255,0.54))] hover:bg-white/82 dark:bg-[linear-gradient(155deg,rgba(20,31,52,0.88),rgba(12,20,36,0.84))] dark:hover:bg-[linear-gradient(155deg,rgba(24,38,63,0.92),rgba(15,24,42,0.88))]": variant === "outline",
      "bg-white/35 shadow-[6px_6px_14px_rgba(170,184,217,0.1)] hover:bg-white/55 dark:bg-[#15213a]/68 dark:hover:bg-[#1a2745]/82": variant === "ghost",
      "border-0 bg-transparent p-0 shadow-none underline-offset-4 hover:underline": variant === "link",
      "bg-[linear-gradient(155deg,rgba(255,194,194,0.92),rgba(255,230,230,0.88))] text-[#8b2330] hover:bg-[linear-gradient(155deg,rgba(255,204,204,0.94),rgba(255,236,236,0.9))] dark:bg-[linear-gradient(155deg,rgba(85,37,47,0.92),rgba(56,22,31,0.9))] dark:text-[#ffb7c0] dark:hover:bg-[linear-gradient(155deg,rgba(97,42,53,0.94),rgba(65,27,36,0.92))]": variant === "danger",
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
