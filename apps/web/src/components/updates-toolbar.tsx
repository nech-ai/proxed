"use client";

import { Button } from "@proxed/ui/components/button";
import { cn } from "@proxed/ui/utils";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@proxed/ui/components/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import { usePathname } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { FaXTwitter } from "react-icons/fa6";
import { CopyInput } from "./copy-input";
import { ChevronDownIcon, ChevronUpIcon, ShareIcon } from "lucide-react";

const popupCenter = ({
	url,
	title,
	w,
	h,
}: { url: string; title: string; w: number; h: number }) => {
	const dualScreenLeft =
		window.screenLeft !== undefined ? window.screenLeft : window.screenX;
	const dualScreenTop =
		window.screenTop !== undefined ? window.screenTop : window.screenY;

	const width = window.innerWidth
		? window.innerWidth
		: document.documentElement.clientWidth
			? document.documentElement.clientWidth
			: screen.width;
	const height = window.innerHeight
		? window.innerHeight
		: document.documentElement.clientHeight
			? document.documentElement.clientHeight
			: screen.height;

	const systemZoom = width / window.screen.availWidth;
	const left = (width - w) / 2 / systemZoom + dualScreenLeft;
	const top = (height - h) / 2 / systemZoom + dualScreenTop;
	const newWindow = window.open(
		url,
		title,
		`
      scrollbars=yes,
      width=${w / systemZoom},
      height=${h / systemZoom},
      top=${top},
      left=${left}
      `,
	);

	return newWindow;
};

export function UpdatesToolbar({
	posts,
}: { posts: { slug: string; title: string }[] }) {
	const pathname = usePathname();
	const currentIndex = posts.findIndex((a) => pathname.endsWith(a.slug)) ?? 0;

	const currentPost = posts[currentIndex];

	const handlePrev = () => {
		if (currentIndex > 0) {
			const nextPost = posts[currentIndex - 1];
			if (!nextPost) {
				return;
			}
			const element = document.getElementById(nextPost?.slug);
			element?.scrollIntoView({
				behavior: "smooth",
			});
		}
	};

	const handleNext = () => {
		if (currentIndex !== posts.length - 1) {
			const nextPost = posts[currentIndex + 1];

			if (!nextPost) {
				return;
			}

			const element = document.getElementById(nextPost?.slug);

			element?.scrollIntoView({
				behavior: "smooth",
			});
		}
	};

	useHotkeys("arrowRight", () => handleNext(), [handleNext]);
	useHotkeys("arrowLeft", () => handlePrev(), [handlePrev]);

	const handleOnShare = () => {
		const popup = popupCenter({
			url: `https://twitter.com/intent/tweet?text=${currentPost?.title} https://nech.ai/updates/${currentPost?.slug}`,
			title: currentPost?.title ?? "",
			w: 800,
			h: 400,
		});

		popup?.focus();
	};

	return (
		<Dialog>
			<div className="fixed right-6 bottom-0 top-0 flex-col items-center justify-center hidden md:flex">
				<TooltipProvider delayDuration={20}>
					<div className="flex flex-col items-center backdrop-blur-xl bg-black/50 p-2 border border-gray-800 space-y-4 rounded-full">
						<Tooltip>
							<TooltipTrigger>
								<DialogTrigger asChild>
									<ShareIcon size={18} className="text-[#606060] -mt-[1px]" />
								</DialogTrigger>
							</TooltipTrigger>
							<TooltipContent
								className="py-1 px-3 rounded-sm"
								sideOffset={25}
								side="right"
							>
								<span className="text-xs">Share</span>
							</TooltipContent>
						</Tooltip>

						<div className="flex flex-col items-center border-t-[1px] border-border space-y-2 pt-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										className={cn(currentIndex === 0 && "opacity-50")}
										onClick={handlePrev}
									>
										<ChevronUpIcon className="h-6 w-6" />
									</button>
								</TooltipTrigger>
								<TooltipContent
									className="py-1 px-3 rounded-sm"
									sideOffset={25}
									side="right"
								>
									<span className="text-xs">Previous post</span>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										className={cn(
											currentIndex === posts.length - 1 && "opacity-50",
										)}
										onClick={handleNext}
									>
										<ChevronDownIcon className="h-6 w-6" />
									</button>
								</TooltipTrigger>
								<TooltipContent
									className="py-1 px-3 rounded-sm"
									sideOffset={25}
									side="right"
								>
									<span className="text-xs">Next post</span>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
				</TooltipProvider>
			</div>

			<DialogContent className="sm:max-w-[425px] bg-[#0C0C0C] border-gray-800">
				<div className="p-6">
					<DialogHeader>
						<DialogTitle className="text-white">Share</DialogTitle>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<CopyInput value={`https://nech.ai${pathname}`} />
						<Button
							className="w-full flex items-center space-x-2 h-10 bg-black hover:bg-gray-900 border border-gray-800"
							onClick={handleOnShare}
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
