import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import { cn } from "@proxed/ui/utils";

interface TeamCardProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

export function TeamCard({
	title,
	description,
	children,
	className,
}: TeamCardProps) {
	return (
		<Card className={cn("mx-auto w-full min-w-[384px] max-w-sm", className)}>
			<CardHeader className="space-y-1">
				<CardTitle className="text-center text-2xl">{title}</CardTitle>
				{description && (
					<CardDescription className="text-center">
						{description}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
