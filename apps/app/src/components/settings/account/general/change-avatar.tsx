"use client";

import { type UpdateUserFormValues, updateUserSchema } from "@/actions/schema";
import { updateUserAction } from "@/actions/update-user-action";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@proxed/supabase/types";
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
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { UserAvatarUpload } from "./user-avatar-upload";

type Props = {
  user: User;
};

export function ChangeAvatar({ user }: Props) {
  const action = useAction(updateUserAction);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      avatar_url: user.avatar_url ?? "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    action.execute({
      avatar_url: data?.avatar_url,
      revalidatePath: "/account",
    });
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
              onSuccess={(avatar_url) => {
                toast({
                  variant: "default",
                  description: "Your avatar has been updated.",
                });
                form.setValue("avatar_url", avatar_url, {
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
              disabled={
                action.status === "executing" || !form.formState.isDirty
              }
            >
              {action.status === "executing" ? (
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
