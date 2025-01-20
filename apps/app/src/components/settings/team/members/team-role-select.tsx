import type { TeamMemberRoleType } from "@proxed/supabase/types";
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
	value: TeamMemberRoleType;
	onSelect: (value: TeamMemberRoleType) => void;
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
