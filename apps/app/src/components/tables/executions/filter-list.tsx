"use client";
import { Button } from "@proxed/ui/components/button";
import { Skeleton } from "@proxed/ui/components/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import { format } from "date-fns";
import { formatDateRange } from "little-date";
import { XIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@proxed/ui/utils";
import { ModelBadge } from "@proxed/ui/components/model-badge";
import {
	getModelBadge,
	getModelDisplayName,
	getProviderForModel,
	isValidModel,
	type Model,
	type Provider,
} from "@proxed/utils/lib/providers";
import {
	formatTokenPricingLabel,
	getModelPricing,
} from "@proxed/utils/lib/pricing";

const listVariant = {
	hidden: { y: 10, opacity: 0 },
	show: {
		y: 0,
		opacity: 1,
		transition: {
			duration: 0.05,
			staggerChildren: 0.06,
		},
	},
};

const itemVariant = {
	hidden: { y: 10, opacity: 0 },
	show: { y: 0, opacity: 1 },
};

type Props = {
	filters: { [key: string]: string | null };
	loading: boolean;
	onRemove: (state: { [key: string]: string | null }) => void;
	className?: string;
};

export function FilterList({ filters, loading, onRemove, className }: Props) {
	const renderFilter = ({
		key,
		value,
	}: {
		key: string;
		value: string | null;
	}) => {
		switch (key) {
			case "start": {
				if (key === "start" && value && filters.end) {
					return formatDateRange(new Date(value), new Date(filters.end), {
						includeTime: false,
					});
				}

				return (
					key === "start" && value && format(new Date(value), "MMM d, yyyy")
				);
			}
			case "model": {
				return value;
			}
			case "finishReason": {
				return value ? value.charAt(0).toUpperCase() + value.slice(1) : null;
			}
			case "provider": {
				return value;
			}
			default:
				return null;
		}
	};

	const handleOnRemove = (key: string) => {
		if (key === "start" || key === "end") {
			onRemove({ start: null, end: null });
			return;
		}

		onRemove({ [key]: null });
	};

	return (
		<motion.ul
			variants={listVariant}
			initial="hidden"
			animate="show"
			className={cn("flex items-center gap-2", className)}
		>
			{loading && (
				<div className="flex gap-2">
					<motion.li key="1" variants={itemVariant}>
						<Skeleton className="h-8 w-[100px] rounded-full" />
					</motion.li>
					<motion.li key="2" variants={itemVariant}>
						<Skeleton className="h-8 w-[100px] rounded-full" />
					</motion.li>
				</div>
			)}

			{!loading &&
				Object.entries(filters)
					.filter(([key, value]) => value !== null && key !== "end")
					.map(([key, value]) => {
						if (key === "model" && value) {
							const modelId = value;
							const isKnownModel = isValidModel(modelId);
							const selectedProvider =
								filters.provider &&
								["OPENAI", "ANTHROPIC", "GOOGLE"].includes(filters.provider)
									? (filters.provider as Provider)
									: null;
							const provider =
								selectedProvider ??
								(isKnownModel ? getProviderForModel(modelId as Model) : null);
							const displayName = isKnownModel
								? getModelDisplayName(modelId as Model)
								: modelId;
							const badge = isKnownModel
								? getModelBadge(modelId as Model)
								: undefined;
							const pricingLabel =
								isKnownModel && provider
									? formatTokenPricingLabel(
											getModelPricing(provider, modelId as Model),
										)
									: null;

							return (
								<motion.li key={key} variants={itemVariant}>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="secondary"
													size="sm"
													className="group flex h-8 items-center gap-1.5 rounded-full px-3 font-normal hover:bg-secondary/80"
													onClick={() => handleOnRemove(key)}
												>
													<XIcon className="size-3 scale-0 transition-all group-hover:scale-100" />
													<span className="flex items-center gap-1 text-sm">
														<span className="truncate max-w-[160px]">
															{displayName}
														</span>
														{badge && (
															<ModelBadge badge={badge} className="mx-0" />
														)}
													</span>
												</Button>
											</TooltipTrigger>
											<TooltipContent className="max-w-[260px]">
												<div className="flex flex-col gap-1 text-xs">
													<span>Model ID: {modelId}</span>
													{pricingLabel ? (
														<span>{pricingLabel}</span>
													) : (
														<span className="text-muted-foreground">
															Pricing unavailable
														</span>
													)}
													{provider && (
														<span className="text-muted-foreground">
															Provider: {provider}
														</span>
													)}
												</div>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</motion.li>
							);
						}

						const filterValue = renderFilter({ key, value });
						if (!filterValue) return null;

						return (
							<motion.li key={key} variants={itemVariant}>
								<Button
									variant="secondary"
									size="sm"
									className="group flex h-8 items-center gap-1.5 rounded-full px-3 font-normal hover:bg-secondary/80"
									onClick={() => handleOnRemove(key)}
								>
									<XIcon className="size-3 scale-0 transition-all group-hover:scale-100" />
									<span className="text-sm">{filterValue}</span>
								</Button>
							</motion.li>
						);
					})}
		</motion.ul>
	);
}
