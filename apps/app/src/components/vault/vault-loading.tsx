import { Skeleton } from "@proxed/ui/components/skeleton";

export function VaultLoading() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{Array.from({ length: 8 }).map((_, index) => (
				<div
					key={index.toString()}
					className="overflow-hidden rounded-lg border border-border"
				>
					<Skeleton className="h-48 w-full" />
					<div className="space-y-2 p-3">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				</div>
			))}
		</div>
	);
}
