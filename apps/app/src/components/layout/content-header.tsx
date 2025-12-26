"use client";

import { Separator } from "@proxed/ui/components/separator";
import { SidebarTrigger, useSidebar } from "@proxed/ui/components/sidebar";
import { cn } from "@proxed/ui/utils";
import type { PropsWithChildren } from "react";
import { UserMenu } from "./user-menu";
import { FeedbackDialog } from "./feedback-dialog";
import { Trial } from "../trial";
import { NotificationCenter } from "../notification-center";
import { useUserQuery } from "@/hooks/use-user";
interface ContentHeaderProps extends PropsWithChildren {
	className?: string;
}

export function ContentHeader({ children, className }: ContentHeaderProps) {
	const { isMobile } = useSidebar();
	const { data: user } = useUserQuery();

	return (
		<div className={cn("border-b bg-background sticky top-0 z-10", className)}>
			<header className="flex min-h-14 items-center container mx-auto px-2 sm:px-4">
				<div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 overflow-hidden">
					{isMobile && (
						<>
							<SidebarTrigger className="flex-shrink-0" />
							<Separator orientation="vertical" className="h-4 flex-shrink-0" />
						</>
					)}
					<div className="overflow-x-auto w-full">{children}</div>
				</div>
				<div className="flex-shrink-0 ml-2 flex items-center gap-2">
					{!isMobile && (
						<>
							<Trial />
							<FeedbackDialog />
						</>
					)}
					<NotificationCenter />
					{user && <UserMenu user={user} />}
				</div>
			</header>
		</div>
	);
}
