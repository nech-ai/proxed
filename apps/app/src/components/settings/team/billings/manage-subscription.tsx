"use client";

import { Card } from "@proxed/ui/components/card";
import { Button } from "@proxed/ui/components/button";
import Link from "next/link";
import { useState } from "react";

export function ManageSubscription({ teamId }: { teamId: string }) {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<div>
			<h2 className="text-lg font-medium leading-none tracking-tight mb-4">
				Subscription
			</h2>

			<Card className="flex justify-between p-4">
				<div className="flex flex-col gap-1">
					<p className="text-sm text-muted-foreground">Current plan</p>
					<p className="text-lg font-medium">Pro</p>
				</div>

				<div className="mt-auto">
					<Link
						href={`/api/portal?id=${teamId}`}
						className="text-sm text-muted-foreground hover:text-primary"
						onClick={() => setIsLoading(true)}
					>
						<Button
							variant="secondary"
							className="h-9 hover:bg-primary hover:text-secondary"
							disabled={isLoading}
						>
							Manage subscription
						</Button>
					</Link>
				</div>
			</Card>
		</div>
	);
}
