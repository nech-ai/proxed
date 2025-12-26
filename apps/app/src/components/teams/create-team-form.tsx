"use client";

import { createTeamSchema } from "@/actions/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@proxed/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@proxed/ui/components/form";
import { Input } from "@proxed/ui/components/input";
import { Loader2, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { TeamCard } from "./team-card";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function CreateTeamForm() {
	const trpc = useTRPC();
	const router = useRouter();
	const createTeam = useMutation(
		trpc.team.create.mutationOptions({
			onSuccess: () => {
				router.push("/teams/invite");
				router.refresh();
			},
		}),
	);

	const form = useForm<z.infer<typeof createTeamSchema>>({
		resolver: zodResolver(createTeamSchema),
		defaultValues: {
			name: "",
		},
	});

	function onSubmit(values: z.infer<typeof createTeamSchema>) {
		createTeam.mutate({
			name: values.name,
		});
	}

	return (
		<TeamCard title="Create Team" description="Create a team to get started">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										autoFocus
										className="mt-3"
										placeholder="Ex: Acme Marketing or Acme Co"
										autoComplete="off"
										autoCapitalize="none"
										autoCorrect="off"
										spellCheck={false}
										{...field}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="pt-2">
						<Button
							className="w-full px-6"
							type="submit"
							variant="default"
							disabled={createTeam.isPending}
						>
							{createTeam.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								<>
									Create Team
									<ChevronRight className="h-4 w-4 ml-2" />
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</TeamCard>
	);
}
