import { Icons } from "@/components/icons";
import { buttonVariants } from "@proxed/ui/components/button";
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
import { cn } from "@proxed/ui/utils";
import Link from "next/link";
import { IoMenuSharp } from "react-icons/io5";

export function MobileDrawer() {
	return (
		<Drawer>
			<DrawerTrigger>
				<IoMenuSharp className="text-2xl" />
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="px-6">
					<Link
						href="/"
						title="brand-logo"
						className="relative mr-6 flex items-center space-x-2"
					>
						<Icons.logo className="w-auto h-[40px]" />
						<DrawerTitle>{siteConfig.name}</DrawerTitle>
					</Link>
					<DrawerDescription>{siteConfig.description}</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter className="flex flex-col gap-2">
					<Link
						href="/login"
						className={cn(
							buttonVariants({ variant: "ghost" }),
							"rounded-full w-full",
						)}
					>
						Login
					</Link>
					<Link
						href="#"
						className={cn(
							buttonVariants({ variant: "default" }),
							"text-white rounded-full group w-full",
						)}
					>
						{siteConfig.cta}
					</Link>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
