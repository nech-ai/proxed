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
import { Input } from "@proxed/ui/components/input";
import { Textarea } from "@proxed/ui/components/textarea";
import {} from "@proxed/ui/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createProjectAction } from "@/actions/create-project-action";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@radix-ui/react-icons";
import { createProjectSchema } from "@/actions/schema";
import type { CreateProjectFormValues } from "@/actions/schema";

export function CreateProjectDialog() {
	const router = useRouter();
	const form = useForm<CreateProjectFormValues>({
		resolver: zodResolver(createProjectSchema),
		defaultValues: {
			name: "",
			description: "",
			bundleId: "",
		},
	});

	async function onSubmit(data: CreateProjectFormValues) {
		const result = await createProjectAction(data);
		if (result?.data?.id) {
			router.push(`/projects/${result.data.id}`);
		}
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon className="mr-2 h-4 w-4" />
					New Project
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Project</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Project name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea placeholder="Project description" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="bundleId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Bundle ID</FormLabel>
									<FormControl>
										<Input placeholder="com.example.app" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							Create Project
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
