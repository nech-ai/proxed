import { Text } from "@react-email/components";
import { darkTheme } from "./Wrapper";

export default function Divider({ text = "or" }: { text?: string }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				margin: "28px 0",
			}}
		>
			<div
				style={{
					height: "1px",
					backgroundColor: darkTheme.border,
					flexGrow: 1,
				}}
			/>
			<Text
				className="text-[14px] mx-[16px] my-0"
				style={{ color: darkTheme.mutedForeground }}
			>
				{text}
			</Text>
			<div
				style={{
					height: "1px",
					backgroundColor: darkTheme.border,
					flexGrow: 1,
				}}
			/>
		</div>
	);
}
