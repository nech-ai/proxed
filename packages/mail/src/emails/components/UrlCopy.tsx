import { Link, Section, Text } from "@react-email/components";
import { darkTheme } from "./Wrapper";

export default function UrlCopy({ url }: { url: string }) {
	return (
		<Section
			className="p-[16px] mb-[28px]"
			style={{ backgroundColor: darkTheme.accent }}
		>
			<Text
				className="text-[13px] leading-[18px] mb-[8px]"
				style={{ color: darkTheme.mutedForeground }}
			>
				Or copy and paste this URL into your browser:
			</Text>
			<Link
				href={url}
				className="text-[13px] underline break-all"
				style={{ color: darkTheme.primary }}
			>
				{url}
			</Link>
		</Section>
	);
}
