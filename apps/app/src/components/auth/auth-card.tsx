import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import { cn } from "@proxed/ui/utils";

interface AuthCardProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

export function AuthCard({
	title,
	description,
	children,
	className,
}: AuthCardProps) {
	return (
		<Card className={cn("mx-auto w-full min-w-[384px] max-w-sm", className)}>
			<CardHeader>
				<CardTitle className="text-2xl font-semibold">{title}</CardTitle>
				{description && (
					<CardDescription className="text-muted-foreground">
						{description}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
