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
import { PlusIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { createProjectSchema } from "@/actions/schema";
import type { CreateProjectFormValues } from "@/actions/schema";
import { useTeamContext } from "@/store/team/hook";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";

export function CreateProjectDialog() {
	const canAccessFeature = useTeamContext((state) => state.canAccessFeature);
	const billing = useTeamContext((state) => state.data.billing);
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

	const canCreate = canAccessFeature("create_project");
	const projectsLimit = billing?.limits?.projects_limit || 0;
	const projectsCount = billing?.limits?.projects_count || 0;

	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="inline-block">
						<DialogTrigger asChild>
							<Button
								disabled={!canCreate}
								variant={canCreate ? "default" : "secondary"}
								className="relative"
							>
								{canCreate ? (
									<PlusIcon className="mr-2 h-4 w-4" />
								) : (
									<LockClosedIcon className="mr-2 h-4 w-4" />
								)}
								New Project
								{!canCreate && (
									<span className="ml-2 text-xs">
										({projectsCount}/{projectsLimit})
									</span>
								)}
							</Button>
						</DialogTrigger>
					</div>
				</TooltipTrigger>
				{!canCreate && (
					<TooltipContent>
						<p>Upgrade your plan to create more projects</p>
						<p className="text-xs text-muted-foreground">
							Your current plan allows {projectsLimit}{" "}
							{projectsLimit === 1 ? "project" : "projects"}
						</p>
					</TooltipContent>
				)}
			</Tooltip>
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
