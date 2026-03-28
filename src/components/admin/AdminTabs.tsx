"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/records", label: "Records" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/models", label: "Models" },
  { href: "/admin/system-health", label: "System health" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            pathname === item.href ? "bg-[#17181f] text-white" : "bg-white text-gray-700 hover:bg-[#f7f4ef]"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
