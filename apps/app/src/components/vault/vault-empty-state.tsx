export function VaultEmptyState({ hasFilters }: { hasFilters: boolean }) {
	return (
		<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
			<h3 className="text-lg font-semibold">
				{hasFilters ? "No results" : "Your vault is empty"}
			</h3>
			<p className="text-sm text-muted-foreground mt-2">
				{hasFilters
					? "Try adjusting your filters to find what you're looking for."
					: "Generated images saved to the vault will show up here."}
			</p>
		</div>
	);
}
