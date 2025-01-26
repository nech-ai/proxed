import { Button } from "@proxed/ui/components/button";
import { Skeleton } from "@proxed/ui/components/skeleton";
import { format } from "date-fns";
import { formatDateRange } from "little-date";
import { XIcon } from "lucide-react";
import { motion } from "motion/react";

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
};

export function FilterList({ filters, loading, onRemove }: Props) {
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
			className="flex space-x-2"
		>
			{loading && (
				<div className="flex space-x-2">
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
						return (
							<motion.li key={key} variants={itemVariant}>
								<Button
									className="group flex h-8 items-center space-x-1 rounded-full bg-secondary px-3 font-normal text-[#878787] hover:bg-secondary"
									onClick={() => handleOnRemove(key)}
								>
									<XIcon className="w-0 scale-0 transition-all group-hover:w-4 group-hover:scale-100" />
									<span>
										{renderFilter({
											key,
											value,
										})}
									</span>
								</Button>
							</motion.li>
						);
					})}
		</motion.ul>
	);
}
