"use client";

import { createTeamAction } from "@/actions/create-team-action";
import { createTeamSchema } from "@/actions/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@proxed/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import { CardContent } from "@proxed/ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@proxed/ui/components/form";
import { Input } from "@proxed/ui/components/input";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import type { z } from "zod";

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
			redirectTo: "/settings/team/members",
		});
	}

	return (
		<Card className="w-[350px]">
			<CardHeader className="space-y-1">
				<CardTitle className="text-center text-2xl">Create Team</CardTitle>
				<CardDescription className="text-center">
					Create a team to get started
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
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

						<Button
							className="mt-6 w-full"
							type="submit"
							variant="default"
							disabled={createTeam.status === "executing"}
						>
							{createTeam.status === "executing" ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Next"
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
