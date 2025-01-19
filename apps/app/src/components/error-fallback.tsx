"use client";

import { Button } from "@proxed/ui/components/button";
import { useRouter } from "next/navigation";

export function ErrorFallback() {
	const router = useRouter();

	return (
		<div className="flex h-full flex-col items-center justify-center space-y-4">
			<div>
				<h2 className="text-md">Something went wrong</h2>
			</div>
			<Button onClick={() => router.refresh()} variant="default">
				Try again
			</Button>
		</div>
	);
}
