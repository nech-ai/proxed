import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@proxed/ui/components/alert";
import { MailCheckIcon } from "lucide-react";

export function TeamInvitationInfo({ className }: { className?: string }) {
	return (
		<Alert variant="default" className={className}>
			<MailCheckIcon className="size-6" />
			<AlertTitle>You have been invited to join a team</AlertTitle>
			<AlertDescription>
				Click the button below to accept the invitation and join the team.
			</AlertDescription>
		</Alert>
	);
}
