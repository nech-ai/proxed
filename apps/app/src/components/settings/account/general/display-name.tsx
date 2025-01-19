"use client";

import { type UpdateUserFormValues, updateUserSchema } from "@/actions/schema";
import { updateUserAction } from "@/actions/update-user-action";
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
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

type Props = {
  fullName: string;
};

export function DisplayName({ fullName }: Props) {
  const action = useAction(updateUserAction);
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      full_name: fullName,
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    action.execute({
      full_name: data?.full_name,
    });
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
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      className="max-w-[300px]"
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
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
