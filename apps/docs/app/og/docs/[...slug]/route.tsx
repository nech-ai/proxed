import type { NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { generate } from "fumadocs-ui/og";
import { getPageImage, source } from "@/lib/source";

export const revalidate = false;

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string[] }> },
) {
	const { slug } = await params;
	const page = source.getPage(slug.slice(0, -1));
	if (!page) notFound();

	return new ImageResponse(
		generate({
			title: page.data.title,
			description: page.data.description,
			site: "Proxed.AI",
		}),
		{
			width: 1200,
			height: 630,
		},
	);
}

export function generateStaticParams() {
	return source.getPages().map((page) => ({
		slug: getPageImage(page).segments,
	}));
}
