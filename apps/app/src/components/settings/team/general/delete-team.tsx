"use client";

import { deleteTeamAction } from "@/actions/delete-team-action";
import { useTeam } from "@/hooks/use-team";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@proxed/ui/components/alert-dialog";
import { Button } from "@proxed/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@proxed/ui/components/card";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";

interface DeleteTeamProps {
  teamId: string;
}

export function DeleteTeam({ teamId }: DeleteTeamProps) {
  const router = useRouter();
  const { teamMembership } = useTeam();
  const deleteTeam = useAction(deleteTeamAction, {
    onSuccess: () => router.push("/teams"),
  });

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Delete team</CardTitle>
        <CardDescription>
          Permanently remove your Team and all of its contents from the
          platform. This action is not reversible — please continue with
          caution.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="text-muted hover:bg-destructive"
              disabled={teamMembership?.role !== "OWNER"}
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                team and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteTeam.execute({ teamId })}>
                {deleteTeam.status === "executing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
