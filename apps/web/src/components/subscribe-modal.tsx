"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@proxed/ui/components/dialog";
import { SubscribeInput } from "./subscribe-form";
import { parseAsBoolean, useQueryState } from "nuqs";

export function SubscribeModal() {
	const [isOpen, setIsOpen] = useQueryState("dialog", parseAsBoolean);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="bg-background/95 border border-border backdrop-blur-lg">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-center">
						Join the Waitlist
					</DialogTitle>
				</DialogHeader>
				<div className="p-6">
					<p className="text-muted-foreground text-center mb-6">
						Be among the first to experience ProxedAI and secure your AI
						wrapper.
					</p>
					<SubscribeInput onSuccess={() => setIsOpen(false)} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
