"use client";

import { Button } from "@proxed/ui/components/button";
import { cn } from "@proxed/ui/utils";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { FaXTwitter } from "react-icons/fa6";
import { CopyInput } from "./copy-input";
import { ChevronDownIcon, ChevronUpIcon, ShareIcon } from "lucide-react";

interface Post {
	slug: string;
	title: string;
}

interface PopupCenterProps {
	url: string;
	title: string;
	w: number;
	h: number;
}

interface NavigationButtonProps {
	direction: "prev" | "next";
	onClick: () => void;
	disabled: boolean;
	isMobile?: boolean;
}

const HEADER_SCROLL_OFFSET = 24;
const POPUP_DIMENSIONS = { width: 800, height: 400 };

const popupCenter = ({ url, title, w, h }: PopupCenterProps) => {
	const dualScreenLeft = window.screenLeft ?? window.screenX;
	const dualScreenTop = window.screenTop ?? window.screenY;

	const width =
		window.innerWidth || document.documentElement.clientWidth || screen.width;
	const height =
		window.innerHeight ||
		document.documentElement.clientHeight ||
		screen.height;

	const systemZoom = width / window.screen.availWidth;
	const left = (width - w) / 2 / systemZoom + dualScreenLeft;
	const top = (height - h) / 2 / systemZoom + dualScreenTop;

	return window.open(
		url,
		title,
		`scrollbars=yes,width=${w / systemZoom},height=${h / systemZoom},top=${top},left=${left}`,
	);
};

function NavigationButton({
	direction,
	onClick,
	disabled,
	isMobile,
}: NavigationButtonProps) {
	const Icon = direction === "prev" ? ChevronUpIcon : ChevronDownIcon;
	const label = direction === "prev" ? "Previous post" : "Next post";

	if (isMobile) {
		return (
			<button
				type="button"
				className={cn(
					"flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-gray-800 bg-black/50",
					disabled && "opacity-50",
				)}
				onClick={onClick}
				disabled={disabled}
			>
				{direction === "prev" && <Icon className="h-4 w-4" />}
				<span className="text-xs">
					{direction === "prev" ? "Previous" : "Next"}
				</span>
				{direction === "next" && <Icon className="h-4 w-4" />}
			</button>
		);
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className={cn(disabled && "opacity-50")}
					onClick={onClick}
					disabled={disabled}
				>
					<Icon className="h-6 w-6" />
				</button>
			</TooltipTrigger>
			<TooltipContent className="py-1 px-3" sideOffset={25} side="right">
				<span className="text-xs">{label}</span>
			</TooltipContent>
		</Tooltip>
	);
}

export function UpdatesToolbar({ posts }: { posts: Post[] }) {
	const pathname = usePathname();
	const router = useRouter();
	const currentIndex = posts.findIndex((a) => pathname.endsWith(a.slug)) ?? 0;
	const isDetailView = pathname.split("/").length > 3;
	const currentPost = posts[currentIndex];

	const scrollToPost = (postSlug: string) => {
		const element = document.getElementById(postSlug);
		if (!element) return;

		const header = document.querySelector("header");
		const headerHeight = header?.offsetHeight || 0;
		const elementPosition =
			element.getBoundingClientRect().top + window.scrollY;

		window.scrollTo({
			top: elementPosition - headerHeight - HEADER_SCROLL_OFFSET,
			behavior: "smooth",
		});
	};

	const handleNavigation = (direction: "prev" | "next") => {
		const targetIndex =
			direction === "prev" ? currentIndex - 1 : currentIndex + 1;
		const targetPost = posts[targetIndex];
		if (!targetPost) return;

		if (isDetailView) {
			router.push(`/updates/${targetPost.slug}`);
		} else {
			scrollToPost(targetPost.slug);
		}
	};

	const handlePrev = () => handleNavigation("prev");
	const handleNext = () => handleNavigation("next");

	useHotkeys("arrowRight", handleNext, [handleNext]);
	useHotkeys("arrowLeft", handlePrev, [handlePrev]);

	const handleShare = () => {
		if (!currentPost) return;
		const shareUrl = `https://twitter.com/intent/tweet?text=${currentPost.title} https://proxed.ai/updates/${currentPost.slug}`;
		const popup = popupCenter({
			url: shareUrl,
			title: currentPost.title,
			w: POPUP_DIMENSIONS.width,
			h: POPUP_DIMENSIONS.height,
		});
		popup?.focus();
	};

	return (
		<Dialog>
			{/* Desktop version */}
			<div className="fixed right-4 bottom-0 top-0 flex-col items-center justify-center hidden md:flex">
				<TooltipProvider delayDuration={20}>
					<div className="flex flex-col items-center backdrop-blur-xl bg-black/50 p-2 border border-gray-800 space-y-4">
						<Tooltip>
							<TooltipTrigger>
								<DialogTrigger asChild>
									<ShareIcon size={18} className="text-[#606060] -mt-[1px]" />
								</DialogTrigger>
							</TooltipTrigger>
							<TooltipContent
								className="py-1 px-3"
								sideOffset={25}
								side="right"
							>
								<span className="text-xs">Share</span>
							</TooltipContent>
						</Tooltip>

						<div className="flex flex-col items-center border-t-[1px] border-border space-y-2 pt-2">
							<NavigationButton
								direction="prev"
								onClick={handlePrev}
								disabled={currentIndex === 0}
							/>
							<NavigationButton
								direction="next"
								onClick={handleNext}
								disabled={currentIndex === posts.length - 1}
							/>
						</div>
					</div>
				</TooltipProvider>
			</div>

			{/* Mobile version */}
			<div className="fixed bottom-0 left-0 right-0 md:hidden">
				<div className="flex items-center justify-between backdrop-blur-xl bg-black/50 px-4 py-3 border-t border-gray-800">
					<NavigationButton
						direction="prev"
						onClick={handlePrev}
						disabled={currentIndex === 0}
						isMobile
					/>

					<DialogTrigger asChild>
						<button
							type="button"
							className="p-1.5 rounded-md border border-gray-800 bg-black/50"
						>
							<ShareIcon size={16} className="text-[#606060]" />
						</button>
					</DialogTrigger>

					<NavigationButton
						direction="next"
						onClick={handleNext}
						disabled={currentIndex === posts.length - 1}
						isMobile
					/>
				</div>
			</div>

			<DialogContent className="sm:max-w-[425px] bg-[#0C0C0C] border-gray-800">
				<div className="p-6">
					<DialogHeader>
						<DialogTitle className="text-white">Share</DialogTitle>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<CopyInput value={`https://proxed.ai${pathname}`} />
						<Button
							className="w-full flex items-center space-x-2 h-10 bg-black hover:bg-gray-900 border border-gray-800"
							onClick={handleShare}
						>
							<span>Share on</span>
							<FaXTwitter />
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
