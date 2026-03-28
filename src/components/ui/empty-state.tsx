import { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="shell-card flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#17181f] text-white">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h3 className="text-xl font-semibold text-gray-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-gray-600">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
