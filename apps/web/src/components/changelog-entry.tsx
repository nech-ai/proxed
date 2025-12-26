import { CustomMDX } from "@/components/mdx";
import { cn } from "@proxed/ui/lib/utils";
import Link from "next/link";
import { GradientText } from "./gradient-text";
import { CopyLinkButton } from "./copy-link-button";

interface ChangelogEntryMetadata {
	title: string;
	publishedAt: string;
	summary: string;
}

interface ChangelogEntryData {
	slug: string;
	metadata: ChangelogEntryMetadata;
	content: string;
}

interface ChangelogEntryProps {
	firstEntry: boolean;
	isLastEntry: boolean;
	data: ChangelogEntryData;
	className?: string;
}

function ChangelogEntryHeader({
	metadata,
	slug,
	firstEntry,
}: {
	metadata: ChangelogEntryMetadata;
	slug: string;
	firstEntry: boolean;
}) {
	return (
		<header className="flex items-start justify-between gap-4">
			<Link
				className="group/title block flex-grow"
				href={`/changelog/${slug}`}
				prefetch={firstEntry}
			>
				<GradientText
					as="h2"
					className="font-medium text-3xl md:text-4xl transition-colors duration-300 group-hover/title:text-sky-300"
				>
					{metadata.title}
				</GradientText>
			</Link>
			<CopyLinkButton slug={slug} className="mt-1 shrink-0" />
		</header>
	);
}

export function ChangelogEntry({
	data,
	firstEntry,
	isLastEntry,
	className,
}: ChangelogEntryProps) {
	const entryDate = new Date(data.metadata.publishedAt);
	const day = entryDate.toLocaleDateString("en-US", { day: "2-digit" });
	const month = entryDate.toLocaleDateString("en-US", { month: "short" });
	const year = entryDate.toLocaleDateString("en-US", { year: "numeric" });

	return (
		<div
			id={data.slug}
			className={cn("group/entry flex items-start", className)}
		>
			<div className="relative mr-6 flex w-20 flex-col items-center self-stretch pt-1 text-right md:mr-10">
				<div className="mb-1.5 text-xs font-medium text-gray-500">
					<span className="block text-xl font-semibold text-sky-500 group-hover/entry:text-sky-400 md:text-2xl transition-colors duration-300">
						{day}
					</span>
					<span className="block leading-tight">{month}</span>
					<span className="block leading-tight">{year}</span>
				</div>
				<div
					className={cn(
						"z-10 h-2.5 w-2.5 shrink-0 rounded-full bg-gray-700 transition-colors duration-300 group-hover/entry:bg-sky-500",
						firstEntry ? "mt-1" : "mt-1",
					)}
				/>
				{!isLastEntry && (
					<div className="mt-1 w-[1px] flex-grow bg-gray-700/80" />
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div
					className={cn(
						"border border-gray-800 bg-gray-950 p-6 shadow-md transition-all duration-300 hover:border-sky-600/80 hover:bg-gray-950/70 hover:shadow-xl hover:shadow-sky-800/20 md:p-8",
					)}
				>
					<article className="space-y-4">
						<ChangelogEntryHeader
							metadata={data.metadata}
							slug={data.slug}
							firstEntry={firstEntry}
						/>
						<div className="prose prose-invert prose-gray max-w-none">
							<div className="mt-3">
								<CustomMDX source={data.content} />
							</div>
						</div>
					</article>
				</div>
			</div>
		</div>
	);
}
