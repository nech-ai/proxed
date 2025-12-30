import { docs, meta } from "@/.source";
import { createMDXSource } from "fumadocs-mdx";
import { type InferPageType, loader } from "fumadocs-core/source";

export const source = loader({
	baseUrl: "/",
	source: createMDXSource(docs, meta),
});

export function getPageImage(page: InferPageType<typeof source>) {
	const segments = [...page.slugs, "image.png"];

	return {
		segments,
		url: `/og/docs/${segments.join("/")}`,
	};
}
