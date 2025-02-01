"use client";

import { subscribeAction } from "@/actions/subscribe-action";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { usePlausible } from "next-plausible";

interface SubscribeInputProps {
	onSuccess?: () => void;
}

function SubmitButton() {
	const { pending } = useFormStatus();
	const plausible = usePlausible();

	if (pending) {
		return (
			<div className="absolute right-2 top-2">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<button
			type="submit"
			onClick={() => plausible("Join")}
			className="absolute right-2 top-2 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 text-sm font-medium hover:opacity-90 transition-opacity"
		>
			Subscribe
		</button>
	);
}

export function SubscribeInput({ onSuccess }: SubscribeInputProps) {
	const [isSubmitted, setSubmitted] = useState(false);

	return (
		<div className="w-full">
			<div className="flex justify-center">
				{isSubmitted ? (
					<div className="w-full rounded-lg border border-border bg-background/50 backdrop-blur h-12 flex items-center justify-between px-4">
						<p className="text-muted-foreground">Thanks for subscribing!</p>
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
							<svg
								width="14"
								height="14"
								viewBox="0 0 14 14"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M11.6666 3.5L5.25 9.91667L2.33333 7"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
					</div>
				) : (
					<form
						action={async (formData) => {
							setSubmitted(true);
							await subscribeAction(formData);
							setTimeout(() => {
								setSubmitted(false);
								onSuccess?.();
							}, 2000);
						}}
						className="w-full"
					>
						<fieldset className="relative w-full">
							<input
								placeholder="Enter your email"
								type="email"
								name="email"
								id="email"
								autoComplete="email"
								aria-label="Email address"
								required
								className="w-full h-12 rounded-lg border border-border bg-background/50 backdrop-blur px-4 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
							/>
							<SubmitButton />
						</fieldset>
					</form>
				)}
			</div>
		</div>
	);
}
