"use client";

import { subscribeAction } from "@/actions/subscribe-action";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { usePlausible } from "next-plausible";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@proxed/ui/components/form";
import { Input } from "@proxed/ui/components/input";
import { Button } from "@proxed/ui/components/button";

const formSchema = z.object({
	email: z.string().email("Please enter a valid email"),
});

interface SubscribeInputProps {
	onSuccess?: () => void;
}

export function SubscribeInput({ onSuccess }: SubscribeInputProps) {
	const [isSubmitted, setSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const plausible = usePlausible();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		const formData = new FormData();
		formData.append("email", values.email);

		try {
			plausible("Join");
			setSubmitted(true);
			await subscribeAction(formData);
			setTimeout(() => {
				setSubmitted(false);
				onSuccess?.();
			}, 2000);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="w-full">
			<div className="flex justify-center">
				{isSubmitted ? (
					<div
						key="success-message"
						className="w-full rounded-lg border border-border bg-background/50 backdrop-blur h-12 flex items-center justify-between px-4"
					>
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
					<Form {...form} key="subscribe-form">
						<form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
							<div className="relative w-full">
								<FormField
									key="email-field"
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													{...field}
													placeholder="Enter your email"
													type="email"
													autoComplete="email"
													className="h-12 pr-24"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="absolute right-2 top-2">
									{isLoading ? (
										<Loader2 className="h-6 w-6 animate-spin text-primary" />
									) : (
										<Button type="submit" size="sm" className="h-8">
											Subscribe
										</Button>
									)}
								</div>
							</div>
						</form>
					</Form>
				)}
			</div>
		</div>
	);
}
