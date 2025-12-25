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
import { Form, FormMessage } from "@proxed/ui/components/form";
import { toast } from "@proxed/ui/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserAvatarUpload } from "./user-avatar-upload";
import { useRouter } from "next/navigation";
import { useUserMutation, useUserQuery } from "@/hooks/use-user";

export function ChangeAvatar() {
	const router = useRouter();
	const { data: user } = useUserQuery();
	const updateUser = useUserMutation();

	const form = useForm<UpdateUserFormValues>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			avatarUrl: "",
		},
	});

	useEffect(() => {
		if (!user) return;
		form.reset({ avatarUrl: user.avatarUrl ?? "" });
	}, [user, form]);

	if (!user) {
		return null;
	}

	const onSubmit = form.handleSubmit((data) => {
		updateUser.mutate(
			{
				avatarUrl: data?.avatarUrl,
			},
			{
				onSuccess: () => {
					router.refresh();
				},
			},
		);
		form.reset();
	});

	return (
		<Form {...form}>
			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Avatar</CardTitle>
						<CardDescription>Change your avatar.</CardDescription>
					</CardHeader>

					<CardContent>
						<UserAvatarUpload
							user={user}
							onSuccess={(avatarUrl) => {
								toast({
									variant: "default",
									description: "Your avatar has been updated.",
								});
								form.setValue("avatarUrl", avatarUrl, {
									shouldDirty: true,
								});
							}}
							onError={(error) => {
								toast({
									variant: "destructive",
									title: "Avatar not updated",
									description: error,
								});
							}}
						/>
						<FormMessage />
					</CardContent>

					<CardFooter className="flex justify-between">
						<div>This is your avatar.</div>
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
