"use client";

import { Separator } from "@proxed/ui/components/separator";
import { SidebarTrigger, useSidebar } from "@proxed/ui/components/sidebar";
import { cn } from "@proxed/ui/utils";
import type { PropsWithChildren } from "react";
import { UserMenu } from "./user-menu";
import { useTeam } from "@/hooks/use-team";

interface ContentHeaderProps extends PropsWithChildren {
  className?: string;
}

export function ContentHeader({ children, className }: ContentHeaderProps) {
  const { isMobile } = useSidebar();
  const { user } = useTeam();

  return (
    <div className={cn("border-b bg-background sticky top-0 z-10", className)}>
      <header className="flex h-14 items-center px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {isMobile && (
            <>
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
            </>
          )}
          {children}
        </div>
        <UserMenu user={user} />
      </header>
    </div>
  );
}
