"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";
import { useSubscribeModal } from "@/context/subscribe-modal-context";
import { SubscribeInput } from "./subscribe-form";
import { cn } from "@proxed/ui/lib/utils";

interface SubscribeModalProps {
	className?: string;
}

export function SubscribeModal({ className }: SubscribeModalProps) {
	const { isOpen, closeModal } = useSubscribeModal();

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
			<DialogContent
				className={cn(
					"sm:max-w-[425px] bg-background/95 border border-border backdrop-blur-lg",
					className,
				)}
			>
				<DialogHeader className="space-y-3">
					<DialogTitle className="text-2xl font-bold text-center">
						Join the Waitlist
					</DialogTitle>
					<DialogDescription className="text-center text-muted-foreground">
						Be among the first to experience ProxedAI and secure your AI
						wrapper.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<SubscribeInput onSuccess={closeModal} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
