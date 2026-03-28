import { RiskLevel } from "@/types";
import { cn } from "@/lib/utils";

const STYLES: Record<RiskLevel, string> = {
  Low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  Moderate: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  High: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200",
};

export function StatusPill({
  label,
  level,
  className,
}: {
  label?: string;
  level: RiskLevel;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", STYLES[level], className)}>
      {label || `${level} risk`}
    </span>
  );
}
