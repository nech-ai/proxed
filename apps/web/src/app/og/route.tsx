import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
	const { searchParams } = req.nextUrl;
	const postTitle = searchParams.get("title") || siteConfig.description;

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#fff",
				// set background image if needed
				backgroundImage: `url(${siteConfig.url}/og.png)`,
				fontSize: 32,
				fontWeight: 600,
			}}
		>
			<div
				style={{
					position: "relative",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					top: "125px",
				}}
			>
				<Icons.logo
					style={{
						color: "#fff",
						width: "64px",
						height: "64px",
					}}
				/>

				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						fontSize: "64px",
						fontWeight: "600",
						marginTop: "24px",
						textAlign: "center",
						color: "#fff",
						width: "60%",
						letterSpacing: "-0.05em", // Added tighter tracking
					}}
				>
					{postTitle}
				</div>
				<div
					style={{
						display: "flex",
						fontSize: "16px",
						fontWeight: "500",
						marginTop: "16px",
						color: "#fff",
					}}
				>
					{siteConfig.name}
				</div>
			</div>

			{/* biome-ignore lint/a11y/useAltText: <explanation> */}
			<img
				src={`${siteConfig.url}/cube.png`}
				width={500}
				style={{
					position: "relative",
					bottom: -100,
					aspectRatio: "auto",
				}}
			/>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
