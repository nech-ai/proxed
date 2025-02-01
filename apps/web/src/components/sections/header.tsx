"use client";

import { Icons } from "@/components/icons";
import { MobileDrawer } from "@/components/mobile-drawer";
import { buttonVariants } from "@proxed/ui/components/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@proxed/ui/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
	const pathname = usePathname();

	const isActive = (path: string) => {
		return pathname === path;
	};

	return (
		<header className="sticky top-0 z-50 bg-background/80 backdrop-blur shadow-md">
			<div className="flex justify-between items-center container mx-auto p-4">
				<div className="flex items-center gap-8">
					<Link
						href="/"
						title="brand-logo"
						className="relative flex items-center space-x-2"
					>
						<Icons.logo className="w-auto" />
						<span className="font-semibold text-lg">{siteConfig.name}</span>
					</Link>
					<nav className="hidden lg:flex items-center gap-6">
						<Link
							href="/about"
							className={cn(
								"transition-colors",
								isActive("/about")
									? "text-foreground font-medium"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							About
						</Link>
						<Link
							href="/updates"
							className={cn(
								"transition-colors",
								isActive("/updates")
									? "text-foreground font-medium"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							Updates
						</Link>
					</nav>
				</div>
				<div className="hidden lg:flex items-center gap-4">
					<Link
						href="#"
						className={cn(
							buttonVariants({ variant: "ghost" }),
							"h-8 tracking-tight font-medium",
						)}
					>
						Login
					</Link>
					<Link
						href="#"
						className={cn(
							buttonVariants({ variant: "default" }),
							"h-8 text-primary-foreground group tracking-tight font-medium",
						)}
					>
						{siteConfig.cta}
					</Link>
				</div>
				<div className="mt-2 cursor-pointer block lg:hidden">
					<MobileDrawer />
				</div>
			</div>
		</header>
	);
}
