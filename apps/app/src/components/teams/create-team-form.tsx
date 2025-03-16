"use client";

import { createTeamAction } from "@/actions/create-team-action";
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
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { TeamCard } from "./team-card";

export function CreateTeamForm() {
	const createTeam = useAction(createTeamAction);

	const form = useForm<z.infer<typeof createTeamSchema>>({
		resolver: zodResolver(createTeamSchema),
		defaultValues: {
			name: "",
		},
	});

	function onSubmit(values: z.infer<typeof createTeamSchema>) {
		createTeam.execute({
			name: values.name,
			redirectTo: "/teams/invite",
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
										spellCheck="false"
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
							disabled={createTeam.status === "executing"}
						>
							{createTeam.status === "executing" ? (
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
