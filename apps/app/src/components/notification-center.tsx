"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@proxed/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@proxed/ui/components/popover";
import { ScrollArea } from "@proxed/ui/components/scroll-area";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@proxed/ui/components/tabs";
import { BellIcon } from "@proxed/ui/icons";
import { cn } from "@proxed/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
	Archive,
	ClipboardCheck,
	Cog,
	FileText,
	Inbox,
	AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NotificationPayload {
	recordId?: string;
	type: string;
	from?: string;
	to?: string;
}

interface Notification {
	id: string;
	read: boolean;
	createdAt: string;
	subject: string;
	content: string;
	payload: NotificationPayload;
	templateIdentifier: string;
}

// Add interface for EmptyState props
interface EmptyStateProps {
	description: string;
}

function EmptyState({ description }: EmptyStateProps) {
	return (
		<div className="flex h-[460px] flex-col items-center justify-center space-y-4 text-center">
			<div className="flex h-16 w-16 items-center justify-center rounded-full border bg-muted">
				<Inbox className="h-8 w-8 text-muted-foreground" />
			</div>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	);
}

// Add interface for NotificationItem props
interface NotificationItemProps {
	id: string;
	setOpen: (open: boolean) => void;
	subject: string;
	content: string;
	createdAt: string;
	recordId?: string;
	from?: string;
	to?: string;
	markMessageAsRead?: (messageId: string) => void;
	type: string;
	read: boolean;
}

function NotificationItem({
	id,
	setOpen,
	content,
	createdAt,
	recordId,
	markMessageAsRead,
	type,
	read,
}: NotificationItemProps) {
	// Define common link classes
	const linkClasses = "flex flex-1 items-center space-x-4 p-3";
	// Define common wrapper classes
	const wrapperClasses = cn(
		"flex items-center justify-between hover:bg-accent",
		!read && "bg-muted/50 hover:bg-muted", // Subtle background for unread
	);

	// Determine icon based on type
	let IconComponent: React.ComponentType<{ className?: string }> = Inbox; // Default icon
	switch (type) {
		case "executions":
			IconComponent = ClipboardCheck;
			break;
		case "alerts":
			IconComponent = AlertTriangle;
			break;
	}

	// Determine href based on type
	let href = "#"; // Default href
	if (type === "executions" && recordId) {
		href = `/executions/${recordId}`;
	}
	if (type === "alerts" && recordId) {
		href = `/projects/${recordId}`;
	}

	return (
		<div className={wrapperClasses}>
			<Link className={linkClasses} onClick={() => setOpen(false)} href={href}>
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background">
					{IconComponent && (
						<IconComponent className="h-4 w-4 text-muted-foreground" />
					)}
				</div>
				<div className="flex-1 space-y-1">
					<p className="text-sm">{content}</p>
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(createdAt))} ago
					</span>
				</div>
			</Link>
			{markMessageAsRead &&
				!read && ( // Only show archive button for unread items in the inbox
					<div className="px-3">
						<Button
							size="icon"
							variant="ghost"
							className="h-8 w-8 rounded-full" // Use default ghost hover
							onClick={() => markMessageAsRead(id)}
							aria-label="Archive notification"
						>
							<Archive className="h-4 w-4" />
						</Button>
					</div>
				)}
		</div>
	);
}

export function NotificationCenter() {
	const [isOpen, setOpen] = useState(false);
	const {
		hasUnseenNotifications,
		notifications,
		markMessageAsRead,
		markAllMessagesAsSeen,
		markAllMessagesAsRead,
	} = useNotifications() as {
		hasUnseenNotifications: boolean;
		notifications: Notification[];
		markMessageAsRead: (messageId: string) => void;
		markAllMessagesAsSeen: () => void;
		markAllMessagesAsRead: () => void;
	};

	const unreadNotifications = notifications.filter(
		(notification) => !notification.read,
	);

	const archivedNotifications = notifications.filter(
		(notification) => notification.read,
	);

	useEffect(() => {
		if (isOpen && hasUnseenNotifications) {
			markAllMessagesAsSeen();
		}
	}, [hasUnseenNotifications, isOpen]);

	return (
		<Popover onOpenChange={setOpen} open={isOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative h-8 w-8 rounded-full"
				>
					{hasUnseenNotifications && (
						<div className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-primary" />
					)}
					<BellIcon className="h-5 w-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="relative h-[535px] w-screen overflow-hidden p-0 shadow-lg md:w-[400px]"
				align="end"
				sideOffset={10}
			>
				<Tabs defaultValue="inbox" className="flex h-full flex-col">
					<div className="relative flex-shrink-0 border-b">
						<TabsList className="grid w-full grid-cols-2 rounded-none border-none bg-transparent px-2 pt-1">
							<TabsTrigger value="inbox" className="font-normal">
								Inbox
							</TabsTrigger>
							<TabsTrigger value="archive" className="font-normal">
								Archive
							</TabsTrigger>
						</TabsList>
						<Link
							href="/settings/account/notifications"
							className="absolute top-1 right-2"
						>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full"
								onClick={() => setOpen(false)}
								aria-label="Notification settings"
							>
								<Cog className="h-4 w-4 text-muted-foreground" />
							</Button>
						</Link>
					</div>

					<TabsContent
						value="inbox"
						className="relative mt-0 flex-1 overflow-hidden"
					>
						{unreadNotifications.length === 0 ? (
							<EmptyState description="Your inbox is clear." />
						) : (
							<>
								<ScrollArea className="h-full pb-12">
									<div className="divide-y">
										{unreadNotifications.map((notification) => (
											<NotificationItem
												key={notification.id}
												id={notification.id}
												markMessageAsRead={markMessageAsRead}
												setOpen={setOpen}
												subject={notification.subject}
												content={notification.content}
												createdAt={notification.createdAt}
												recordId={notification.payload.recordId}
												type={
													notification.payload.type ??
													notification.templateIdentifier
												}
												from={notification.payload?.from}
												to={notification.payload?.to}
												read={false}
											/>
										))}
									</div>
								</ScrollArea>
								<div className="absolute bottom-0 flex h-12 w-full items-center justify-center border-t bg-background">
									<Button
										variant="ghost"
										size="sm"
										onClick={markAllMessagesAsRead}
									>
										Archive all
									</Button>
								</div>
							</>
						)}
					</TabsContent>

					<TabsContent value="archive" className="mt-0 flex-1 overflow-hidden">
						{archivedNotifications.length === 0 ? (
							<EmptyState description="No archived notifications." />
						) : (
							<ScrollArea className="h-full">
								<div className="divide-y">
									{archivedNotifications.map((notification) => (
										<NotificationItem
											key={notification.id}
											id={notification.id}
											setOpen={setOpen}
											subject={notification.subject}
											content={notification.content}
											createdAt={notification.createdAt}
											recordId={notification.payload.recordId}
											type={
												notification.payload.type ??
												notification.templateIdentifier
											}
											read={true}
										/>
									))}
								</div>
							</ScrollArea>
						)}
					</TabsContent>
				</Tabs>
			</PopoverContent>
		</Popover>
	);
}
