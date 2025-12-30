import { docs, meta } from "@/.source/server";
import { type InferPageType, loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";

export const source = loader({
	baseUrl: "/",
	source: toFumadocsSource(docs, meta),
});

export function getPageImage(page: InferPageType<typeof source>) {
	const segments = [...page.slugs, "image.png"];

	return {
		segments,
		url: `/og/docs/${segments.join("/")}`,
	};
}
