"use client";

import { cn } from "@proxed/ui/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SecondaryMenu({
  items,
}: {
  items: { title: string; href: string }[];
}) {
  const pathname = usePathname();
  const isActiveMenuItem = (href: string) => pathname.includes(href);
  return (
    <nav className="py-4">
      <ul className="scrollbar-hide flex space-x-4 overflow-auto text-sm">
        {items.map((item) => (
          <Link
            prefetch
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-4 py-2 transition-colors hover:bg-muted/50",
              isActiveMenuItem(item.href)
                ? "bg-muted font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            <span>{item.title}</span>
          </Link>
        ))}
      </ul>
    </nav>
  );
}
