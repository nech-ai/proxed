"use client";

import type React from "react";
import { useState } from "react";
import { cn } from "@proxed/ui/utils";

interface FeatureOption {
	id: number;
	title: string;
	description: string;
	code: string;
}

interface FeatureButtonProps {
	option: FeatureOption;
	isSelected: boolean;
	onClick: () => void;
}

function FeatureButton({ option, isSelected, onClick }: FeatureButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex-shrink-0 w-64 md:w-full text-left p-4 mb-2 mr-2 last:mr-0 md:mr-0 border border-border",
				isSelected ? "bg-accent/70" : "hover:bg-muted/50",
			)}
		>
			<h3 className="font-medium tracking-tight">{option.title}</h3>
			<p className="text-sm text-muted-foreground">{option.description}</p>
		</button>
	);
}

interface CodeDisplayProps {
	code: string;
}

function CodeDisplay({ code }: CodeDisplayProps) {
	return (
		<div
			className="bg-background font-mono text-sm [&>pre]:!bg-transparent [&>pre]:p-4 [&_code]:break-all md:max-h-[45vh] overflow-scroll"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Code is sanitized by the build process
			dangerouslySetInnerHTML={{ __html: code }}
		/>
	);
}

interface FeatureSelectorProps {
	features: FeatureOption[];
	className?: string;
}

export function FeatureSelector({ features, className }: FeatureSelectorProps) {
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const selectedFeature = features[selectedIndex];

	return (
		<div className={cn("grid grid-cols-1 md:grid-cols-5 relative", className)}>
			<div className="md:col-span-2 border-b md:border-b-0 bg-background md:border-r border-border sticky top-[var(--header-height)]">
				<div className="flex md:flex-col feature-btn-container overflow-x-auto p-4 pb-2">
					{features.map((option, index) => (
						<FeatureButton
							key={option.id}
							option={option}
							isSelected={selectedIndex === index}
							onClick={() => setSelectedIndex(index)}
						/>
					))}
				</div>
			</div>
			<div className="col-span-1 md:col-span-3">
				{selectedFeature && <CodeDisplay code={selectedFeature.code} />}
			</div>
		</div>
	);
}
