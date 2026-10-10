"use client";

import { Icons } from "@/components/icons";
import { MobileDrawer } from "@/components/mobile-drawer";
import { Button } from "@proxed/ui/components/button";
import { SiteBanner } from "@proxed/ui/components/site-banner";
import { siteConfig } from "@/lib/config";
import { cn } from "@proxed/ui/utils";
import Link from "next/link";
import { usePlausible } from "next-plausible";
import { usePathname } from "next/navigation";
import { SITE_COPY, isRegistrationEnabled } from "@proxed/utils/lib/site";
import { CtaButton } from "../cta-button";
import { Suspense } from "react";

export function Header() {
	const pathname = usePathname();
	const plausible = usePlausible();

	const isActive = (path: string) => {
		return pathname.includes(path);
	};

	const registrationOpen = isRegistrationEnabled();

	return (
		<div className="sticky top-0 z-50">
			{registrationOpen ? null : (
				<SiteBanner className="bg-zinc-950/90 text-zinc-100 border-zinc-800">
					{SITE_COPY.banner}
				</SiteBanner>
			)}
			<header className="bg-background/80 backdrop-blur shadow-md">
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
							<Link
								href="/changelog"
								className={cn(
									"transition-colors",
									isActive("/changelog")
										? "text-foreground font-medium"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								Changelog
							</Link>
						</nav>
					</div>
					<div className="hidden lg:flex items-center gap-4">
						<Button
							asChild
							variant="ghost"
							onClick={() => plausible("Login")}
							className="h-8 tracking-tight font-medium"
						>
							<Link href="https://app.proxed.ai/login">Login</Link>
						</Button>
						{registrationOpen ? (
							<Suspense fallback={null}>
								<CtaButton />
							</Suspense>
						) : null}
					</div>
					<div className="mt-2 cursor-pointer block lg:hidden">
						<MobileDrawer />
					</div>
				</div>
			</header>
		</div>
	);
}
