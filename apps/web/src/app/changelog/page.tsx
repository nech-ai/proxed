import { ChangelogEntry } from "@/components/changelog-entry";
import { AnimatedChangelogEntry } from "@/components/animated-changelog-entry";
import { Section } from "@/components/section";
import { generateMetadata } from "@/lib/metadata";
import { getChangelogChanges } from "@/lib/changelog";
import { GradientText } from "@/components/gradient-text";

export const metadata = generateMetadata({
	title: "Changelog | Proxed.AI",
	description:
		"Stay updated on Proxed.AI's development journey. Read about our latest features, engineering insights, and product announcements as we build the future of AI model management.",
	path: "/changelog",
});

export default async function Page() {
	const data = getChangelogChanges();

	const sortedEntries = data.sort((a, b) => {
		if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
			return -1;
		}
		return 1;
	});

	let entriesElements: React.ReactNode;

	if (sortedEntries.length === 0) {
		entriesElements = (
			<div className="text-center text-gray-500 py-12">
				<h2 className="text-2xl font-semibold text-gray-400 mb-3">
					No Updates Yet
				</h2>
				<p>Check back soon to see our latest developments!</p>
			</div>
		);
	} else {
		const delayClasses = [undefined, "delay-100", "delay-200", "delay-300"];

		entriesElements = sortedEntries.map((entry, index) => (
			<AnimatedChangelogEntry
				key={entry.slug}
				delay={delayClasses[index % delayClasses.length]}
			>
				<ChangelogEntry
					data={entry}
					firstEntry={index === 0}
					isLastEntry={index === sortedEntries.length - 1}
				/>
			</AnimatedChangelogEntry>
		));
	}

	return (
		<div className="flex justify-center py-12">
			<Section id="changelog-page-content">
				<div className="border-b p-8 backdrop-blur mb-12 md:mb-16">
					<GradientText
						as="h1"
						className="font-medium text-center text-4xl md:text-5xl mb-6 leading-snug"
					>
						Changelog
					</GradientText>
					<p className="text-lg text-center text-gray-400 max-w-2xl mx-auto">
						{metadata.description as string}
					</p>
				</div>

				{sortedEntries.length > 0 ? (
					<div className="space-y-8 md:space-y-10">{entriesElements}</div>
				) : (
					entriesElements
				)}
			</Section>
		</div>
	);
}
