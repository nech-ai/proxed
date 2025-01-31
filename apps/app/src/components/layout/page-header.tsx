"use client";

import { ContentHeader } from "./content-header";
import { cn } from "@proxed/ui/utils";
import type { ReactNode } from "react";
import { Button } from "@proxed/ui/components/button";
import { MenuIcon } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@proxed/ui/components/sheet";
import { useMediaQuery } from "@proxed/ui/hooks/use-media-query";

interface PageHeaderProps {
	title: string;
	description?: string;
	children?: ReactNode;
	className?: string;
}

export function PageHeader({
	title,
	description,
	children,
	className,
}: PageHeaderProps) {
	const isMobile = useMediaQuery("(max-width: 768px)");

	const headerContent = (
		<div className="flex min-w-0 flex-col gap-1">
			<h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
			{description && (
				<p
					className={cn(
						"text-sm text-muted-foreground",
						"hidden md:block",
						"line-clamp-1",
					)}
				>
					{description}
				</p>
			)}
		</div>
	);

	const actionButtons = children && (
		<div className="flex shrink-0 items-center gap-3">{children}</div>
	);

	return (
		<ContentHeader>
			<div
				className={cn(
					"flex items-center justify-between gap-4 py-4",
					"min-h-[3.5rem] md:min-h-[4.5rem]",
					className,
				)}
			>
				{headerContent}

				{isMobile && actionButtons ? (
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="shrink-0">
								<MenuIcon className="h-5 w-5" />
								<span className="sr-only">Open actions menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent
							side="top"
							className="w-full max-h-[80vh] overflow-y-auto"
						>
							<SheetHeader>
								<SheetTitle>{title}</SheetTitle>
								{description && (
									<p className="text-sm text-muted-foreground">{description}</p>
								)}
							</SheetHeader>
							<div className="flex flex-col gap-4 py-6">{actionButtons}</div>
						</SheetContent>
					</Sheet>
				) : (
					actionButtons
				)}
			</div>
		</ContentHeader>
	);
}
