"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@proxed/ui/lib/utils";

const ANIMATION_CONFIG = {
	initial: { opacity: 0, y: 20, scale: 0.95 },
	animate: { opacity: 1, y: 0, scale: 1 },
	exit: { opacity: 0, y: 20, scale: 0.95 },
	transition: {
		duration: 0.3,
		ease: [0.16, 1, 0.3, 1],
	},
} as const;

type DialogContentProps = React.ComponentPropsWithoutRef<
	typeof DialogPrimitive.Content
>;
type DialogOverlayProps = React.ComponentPropsWithoutRef<
	typeof DialogPrimitive.Overlay
>;
type DialogTitleProps = React.ComponentPropsWithoutRef<
	typeof DialogPrimitive.Title
>;
type DialogDescriptionProps = React.ComponentPropsWithoutRef<
	typeof DialogPrimitive.Description
>;

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	DialogOverlayProps
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
			"data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	DialogContentProps
>(({ className, children, ...props }, ref) => (
	<DialogPortal>
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<DialogOverlay />
			<AnimatePresence>
				<motion.div {...ANIMATION_CONFIG}>
					<DialogPrimitive.Content
						ref={ref}
						onClick={(e) => e.stopPropagation()}
						className={cn(
							"relative z-50 w-full max-w-lg gap-4 p-6 shadow-lg",
							"bg-background border border-border",
							className,
						)}
						{...props}
					>
						{children}
					</DialogPrimitive.Content>
				</motion.div>
			</AnimatePresence>
		</div>
	</DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
));
DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			className,
		)}
		{...props}
	/>
));
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	DialogTitleProps
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			"font-semibold text-lg leading-none tracking-tight",
			className,
		)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	DialogDescriptionProps
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-muted-foreground text-sm", className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
