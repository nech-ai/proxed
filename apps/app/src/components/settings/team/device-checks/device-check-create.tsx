"use client";

import { createDeviceCheckAction } from "@/actions/create-device-check-action";
import {
  type CreateDeviceCheckFormValues,
  createDeviceCheckSchema,
} from "@/actions/schema";
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
import { Label } from "@proxed/ui/components/label";
import { useToast } from "@proxed/ui/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

interface DeviceCheckCreateFormProps {
  onSuccess?: () => void;
  revalidatePath?: string;
}

export function DeviceCheckCreateForm({
  onSuccess,
  revalidatePath,
}: DeviceCheckCreateFormProps) {
  const { toast } = useToast();
  const form = useForm<CreateDeviceCheckFormValues>({
    resolver: zodResolver(createDeviceCheckSchema),
    defaultValues: {
      name: "",
      key_id: "",
      private_key_p8: "",
      apple_team_id: "",
      revalidatePath,
    },
  });

  const createDeviceCheck = useAction(createDeviceCheckAction, {
    onSuccess: () => {
      form.reset();
      toast({
        title: "Device Check created",
        description:
          "The Device Check configuration has been created successfully.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error?.error?.serverError || "Failed to create Device Check",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createDeviceCheck.execute(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Create Device Check Configuration</CardTitle>
            <CardDescription>
              Configure Apple Device Check for your application.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Device Check" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="key_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key ID</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC123DEFG" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apple_team_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apple Team ID</FormLabel>
                  <FormControl>
                    <Input placeholder="TEAM123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="private_key_p8"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Private Key (p8 file)</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      <Input
                        type="file"
                        accept=".p8"
                        className="hidden"
                        id="p8-file"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          try {
                            const content = await file.text();
                            onChange(content);
                          } catch (error) {
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description: "Failed to read p8 file",
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor="p8-file"
                        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload p8 file
                      </Label>
                      {field.value && (
                        <div className="text-sm text-muted-foreground">
                          File loaded
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={
                createDeviceCheck.status === "executing" ||
                !form.formState.isDirty
              }
            >
              {createDeviceCheck.status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create configuration"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
