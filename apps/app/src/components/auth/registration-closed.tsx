import { Button } from "@proxed/ui/components/button";
import { SITE_COPY } from "@proxed/utils/lib/site";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "./auth-card";

export function RegistrationClosed() {
	return (
		<AuthCard
			title={SITE_COPY.registrationClosedTitle}
			description={SITE_COPY.registrationClosedDescription}
		>
			<Button asChild className="w-full">
				<Link href="/login">
					Sign in
					<ArrowRightIcon className="size-4" />
				</Link>
			</Button>
		</AuthCard>
	);
}
