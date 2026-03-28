import { AlertTriangle, LucideIcon, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RecoveryState({
  title,
  description,
  actionLabel = "Try again",
  onAction,
  icon: Icon = AlertTriangle,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-[28px] border border-amber-200 bg-amber-50/80 p-6 text-amber-950">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white p-2 text-amber-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-amber-900/85">{description}</p>
          {onAction ? (
            <Button className="mt-4" variant="outline" onClick={onAction}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
