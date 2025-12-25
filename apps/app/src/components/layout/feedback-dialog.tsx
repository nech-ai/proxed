"use client";

import { Button } from "@proxed/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@proxed/ui/components/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@proxed/ui/components/form";
import { Textarea } from "@proxed/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { feedbackSchema } from "@/actions/schema";
import type { FeedbackFormValues } from "@/actions/schema";
import { MessageSquareText } from "lucide-react";
import { useToast } from "@proxed/ui/hooks/use-toast";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export function FeedbackDialog() {
	const { toast } = useToast();
	const [open, setOpen] = useState(false);

	const form = useForm<FeedbackFormValues>({
		resolver: zodResolver(feedbackSchema),
		defaultValues: {
			message: "",
		},
	});

	const trpc = useTRPC();
	const submitFeedback = useMutation(
		trpc.support.feedback.mutationOptions({
			onSuccess: () => {
				toast({
					title: "Feedback sent",
					description: "Thank you for your feedback!",
				});
				form.reset();
				setOpen(false);
			},
			onError: (error) => {
				toast({
					variant: "destructive",
					title: "Error",
					description: error?.message || "Failed to send feedback",
				});
			},
		}),
	);

	function onSubmit(values: FeedbackFormValues) {
		submitFeedback.mutate({ message: values.message });
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<MessageSquareText className="h-4 w-4 mr-2" />
					Feedback
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Send Feedback</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 pt-4"
					>
						<FormField
							control={form.control}
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Your feedback</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Tell us what you think..."
											className="min-h-[120px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end">
							<Button type="submit" disabled={submitFeedback.isPending}>
								{submitFeedback.isPending ? "Sending..." : "Send Feedback"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
