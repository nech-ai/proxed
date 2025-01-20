export function PostStatus({ status }: { status: string }) {
	return (
		<div className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400 backdrop-blur font-mono mb-4">
			{status}
		</div>
	);
}
