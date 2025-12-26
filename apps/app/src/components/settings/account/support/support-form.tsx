"use client";

import { type SupportFormValues, supportSchema } from "@/actions/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@proxed/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@proxed/ui/components/form";
import { Input } from "@proxed/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@proxed/ui/components/select";
import { Textarea } from "@proxed/ui/components/textarea";
import { useToast } from "@proxed/ui/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export function SupportForm() {
	const { toast } = useToast();
	const [isSubmitted, setIsSubmitted] = useState(false);

	const form = useForm<SupportFormValues>({
		resolver: zodResolver(supportSchema),
		defaultValues: {
			subject: "",
			category: "question",
			priority: "medium",
			message: "",
		},
	});

	const trpc = useTRPC();
	const supportRequest = useMutation(
		trpc.support.support.mutationOptions({
			onSuccess: () => {
				toast({
					title: "Support request sent",
					description: "We'll get back to you as soon as possible.",
				});
				form.reset();
				setIsSubmitted(true);
			},
			onError: (error) => {
				toast({
					variant: "destructive",
					title: "Error",
					description: error?.message || "Failed to send support request",
				});
			},
		}),
	);

	const onSubmit = form.handleSubmit((data) => {
		supportRequest.mutate(data);
	});

	if (isSubmitted) {
		return (
			<Card>
				<CardContent className="pt-6 flex flex-col items-center justify-center text-center py-10">
					<CheckCircle2 className="h-16 w-16 text-primary mb-4" />
					<h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
					<p className="text-muted-foreground max-w-md">
						Your support request has been successfully submitted. Our team will
						review it and get back to you as soon as possible.
					</p>
					<Button
						className="mt-6"
						variant="outline"
						onClick={() => setIsSubmitted(false)}
					>
						Submit Another Request
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Contact Support</CardTitle>
						<CardDescription>
							Fill out this form to get help from our support team.
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="subject"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Subject</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="Brief description of your issue"
											className="max-w-[600px]"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="bug">Bug Report</SelectItem>
												<SelectItem value="feature">Feature Request</SelectItem>
												<SelectItem value="question">
													General Question
												</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="priority"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Priority</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a priority" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="low">Low</SelectItem>
												<SelectItem value="medium">Medium</SelectItem>
												<SelectItem value="high">High</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Message</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Please describe your issue in detail"
											className="min-h-[150px]"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>

					<CardFooter className="flex justify-end">
						<Button type="submit" disabled={supportRequest.isPending}>
							{supportRequest.isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Sending...
								</>
							) : (
								"Send Request"
							)}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
