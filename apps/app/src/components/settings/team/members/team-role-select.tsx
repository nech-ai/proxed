import type { RouterOutputs } from "@/trpc/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@proxed/ui/components/select";

export function TeamRoleSelect({
	value,
	onSelect,
	disabled,
}: {
	value: RouterOutputs["team"]["members"][number]["role"];
	onSelect: (value: RouterOutputs["team"]["members"][number]["role"]) => void;
	disabled?: boolean;
}) {
	const roleOptions = [
		{
			label: "Member",
			value: "MEMBER",
		},
		{
			label: "Owner",
			value: "OWNER",
		},
	];

	return (
		<Select value={value} onValueChange={onSelect} disabled={disabled}>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{roleOptions.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
