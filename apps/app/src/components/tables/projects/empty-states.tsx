"use client";
import { Button } from "@proxed/ui/components/button";
import { ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
	hasFilters?: boolean;
};

export function NoResults({ hasFilters }: Props) {
	const router = useRouter();

	return (
		<div className="flex h-[calc(50vh-300px)] items-center justify-center">
			<div className="flex flex-col items-center">
				<ReceiptText className="mb-4" />
				<div className="mb-6 space-y-2 text-center">
					<h2 className="font-medium text-lg">No results</h2>
					<p className="text-[#606060] text-sm">
						{hasFilters
							? "Try another search, or adjusting the filters"
							: "There are no projects yet"}
					</p>
				</div>

				{hasFilters && (
					<Button variant="default" onClick={() => router.push("/projects")}>
						Clear filters
					</Button>
				)}
			</div>
		</div>
	);
}
