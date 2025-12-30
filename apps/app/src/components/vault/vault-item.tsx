"use client";

import { useUserContext } from "@/store/user/hook";
import { format } from "date-fns";
import { UTCDate } from "@date-fns/utc";
import { VaultItemActions } from "./vault-item-actions";
import Image from "next/image";

export type VaultItemData = {
	id: string;
	url?: string | null;
	path?: string | null;
	mimeType: string;
	createdAt: string;
	project?: { id: string; name: string; bundleId: string } | null;
};

export function VaultItem({ item }: { item: VaultItemData }) {
	const { dateFormat } = useUserContext((state) => state.data);
	const formattedDate = format(
		new UTCDate(item.createdAt),
		dateFormat || "yyyy-MM-dd HH:mm:ss",
	);
	const filename = item.path?.split("/").pop() ?? "Untitled";

	return (
		<div className="group relative overflow-hidden rounded-lg border border-border bg-card">
			<div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
				{item.path && <VaultItemActions id={item.id} path={item.path} />}
			</div>
			<div className="relative h-48 w-full overflow-hidden bg-muted/20">
				{item.url && item.mimeType.startsWith("image/") ? (
					<Image
						src={item.url}
						alt={filename}
						fill
						className="object-cover"
						sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
						unoptimized
					/>
				) : (
					<div className="flex h-full items-center justify-center text-xs text-muted-foreground">
						No preview
					</div>
				)}
			</div>
			<div className="space-y-1 p-3">
				<div className="flex items-center justify-between gap-2">
					<p className="text-sm font-medium truncate">{filename}</p>
					{item.project?.name && (
						<span className="text-xs text-muted-foreground truncate">
							{item.project.name}
						</span>
					)}
				</div>
				<p className="text-xs text-muted-foreground">{formattedDate}</p>
			</div>
		</div>
	);
}
