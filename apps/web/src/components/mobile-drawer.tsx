import { Icons } from "@/components/icons";
import { Button } from "@proxed/ui/components/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@proxed/ui/components/drawer";
import { siteConfig } from "@/lib/config";
import Link from "next/link";
import { IoMenuSharp } from "react-icons/io5";
import { CtaButton } from "@/components/cta-button";

export function MobileDrawer() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="ghost" size="icon">
					<IoMenuSharp className="text-2xl" />
				</Button>
			</DrawerTrigger>
			<DrawerContent className="fixed bottom-0 left-0 right-0 max-h-[96%] rounded-t-[10px] border-t bg-background">
				<div className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-muted" />
				<DrawerHeader className="px-6 pt-2">
					<Link
						href="/"
						title="brand-logo"
						className="relative mr-6 flex items-center space-x-2"
					>
						<Icons.logo className="h-[40px] w-auto" />
						<DrawerTitle>{siteConfig.name}</DrawerTitle>
					</Link>
					<DrawerDescription className="text-sm text-muted-foreground">
						{siteConfig.description}
					</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter className="flex flex-col gap-2 px-6 pb-8">
					<Button variant="ghost" className="w-full" disabled>
						Login
					</Button>
					<CtaButton className="w-full" />
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
