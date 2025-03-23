import { Button } from "@react-email/components";
import { darkTheme } from "./Wrapper";

export default function PrimaryButton({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<Button
			href={href}
			className="px-[32px] py-[14px] text-[16px] no-underline text-center inline-block"
			style={{
				backgroundColor: darkTheme.primary,
				color: "#FFFFFF",
				fontWeight: "normal",
				boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
			}}
		>
			{children}
		</Button>
	);
}
