"use client";

import { Icons } from "@/components/icons";
import { Button } from "@proxed/ui/components/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@proxed/ui/components/drawer";
import { siteConfig } from "@/lib/config";
import { cn } from "@proxed/ui/lib/utils";
import Link from "next/link";
import { IoMenuSharp } from "react-icons/io5";
import { CtaButton } from "@/components/cta-button";
import { usePathname } from "next/navigation";

interface DrawerHeaderContentProps {
	className?: string;
}

function DrawerHeaderContent({ className }: DrawerHeaderContentProps) {
	return (
		<Link
			href="/"
			title="brand-logo"
			className={cn("relative mr-6 flex items-center space-x-2", className)}
			legacyBehavior
		>
			<Icons.logo className="h-[40px] w-auto" />
			<DrawerTitle>{siteConfig.name}</DrawerTitle>
		</Link>
	);
}

interface DrawerActionsProps {
	className?: string;
}

function DrawerActions({ className }: DrawerActionsProps) {
	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Button variant="ghost" className="w-full" disabled>
				Login
			</Button>
			<CtaButton className="w-full" />
		</div>
	);
}

interface NavLinkProps {
	href: string;
	children: React.ReactNode;
	isActive: boolean;
	onClose?: () => void;
}

function NavLink({ href, children, isActive, onClose }: NavLinkProps) {
	return (
		<DrawerClose asChild>
			<Link
				href={href}
				onClick={onClose}
				className={cn(
					"block px-4 py-2 text-sm transition-colors",
					isActive
						? "text-foreground font-medium"
						: "text-muted-foreground hover:text-foreground",
				)}
				legacyBehavior
			>
				{children}
			</Link>
		</DrawerClose>
	);
}

interface MobileDrawerProps {
	className?: string;
}

export function MobileDrawer({ className }: MobileDrawerProps) {
	const pathname = usePathname();
	const isActive = (path: string) => pathname.includes(path);

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="ghost" size="icon">
					<IoMenuSharp className="text-2xl" />
				</Button>
			</DrawerTrigger>
			<DrawerContent
				className={cn(
					"fixed bottom-0 left-0 right-0 max-h-[96%] rounded-t-[10px] border-t bg-background",
					className,
				)}
			>
				<div className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-muted" />
				<DrawerHeader className="px-6 pt-2">
					<DrawerHeaderContent />
					<DrawerDescription className="text-sm text-muted-foreground">
						{siteConfig.description}
					</DrawerDescription>
				</DrawerHeader>
				<nav className="flex flex-col px-2 py-2">
					<NavLink href="/about" isActive={isActive("/about")}>
						About
					</NavLink>
					<NavLink href="/updates" isActive={isActive("/updates")}>
						Updates
					</NavLink>
					<NavLink href="/changelog" isActive={isActive("/changelog")}>
						Changelog
					</NavLink>
				</nav>
				<DrawerFooter className="px-6 pb-8">
					<DrawerActions />
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
