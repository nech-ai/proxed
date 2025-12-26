"use client";

import { type UpdateUserFormValues, updateUserSchema } from "@/actions/schema";
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
	FormMessage,
} from "@proxed/ui/components/form";
import { Input } from "@proxed/ui/components/input";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUserMutation, useUserQuery } from "@/hooks/use-user";

export function DisplayName() {
	const router = useRouter();
	const { data: user } = useUserQuery();
	const updateUser = useUserMutation();

	const form = useForm<UpdateUserFormValues>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			fullName: "",
		},
	});

	useEffect(() => {
		if (!user) return;
		form.reset({ fullName: user.fullName ?? "" });
	}, [user, form]);

	if (!user) {
		return null;
	}

	const onSubmit = form.handleSubmit((data) => {
		updateUser.mutate(
			{
				fullName: data?.fullName,
			},
			{
				onSuccess: () => {
					router.refresh();
				},
			},
		);
	});

	return (
		<Form {...form}>
			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Display Name</CardTitle>
						<CardDescription>
							Please enter your full name, or a display name you are comfortable
							with.
						</CardDescription>
					</CardHeader>

					<CardContent>
						<FormField
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											{...field}
											className="max-w-[300px]"
											autoComplete="off"
											autoCapitalize="none"
											autoCorrect="off"
											spellCheck={false}
											maxLength={32}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>

					<CardFooter className="flex justify-between">
						<div>Please use 32 characters at maximum.</div>
						<Button
							type="submit"
							disabled={updateUser.isPending || !form.formState.isDirty}
						>
							{updateUser.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Save"
							)}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
